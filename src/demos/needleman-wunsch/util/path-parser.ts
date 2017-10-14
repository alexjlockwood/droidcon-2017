import { Command } from './command';
import { Point } from 'scripts/types';
import { SvgChar } from './svgchar';

/**
 * Takes an SVG path string (i.e. the text specified in the path's 'd' attribute) and returns
 * list of DrawCommands that represent the SVG path's individual sequence of instructions.
 * Arcs are converted to bezier curves because they make life too complicated. :D
 */
export function parse(pathString: string): Command[] {
  enum Token {
    AbsoluteCommand = 1,
    RelativeCommand,
    Value,
    EOF,
  }

  // Trim surrounding whitespace.
  pathString = pathString.trim();

  let index = 0;
  let currentToken: Token;

  const advanceToNextTokenFn: (() => Token) = () => {
    while (index < pathString.length) {
      const c = pathString.charAt(index);
      if ('a' <= c && c <= 'z') {
        return (currentToken = Token.RelativeCommand);
      } else if ('A' <= c && c <= 'Z') {
        return (currentToken = Token.AbsoluteCommand);
      } else if (('0' <= c && c <= '9') || c === '.' || c === '-') {
        return (currentToken = Token.Value);
      }
      // Skip unrecognized character.
      index++;
    }
    return (currentToken = Token.EOF);
  };

  const consumeCommandFn = () => {
    advanceToNextTokenFn();
    if (currentToken !== Token.RelativeCommand && currentToken !== Token.AbsoluteCommand) {
      throw new Error('Expected command');
    }
    return pathString.charAt(index++);
  };

  const consumeValueFn = () => {
    advanceToNextTokenFn();
    if (currentToken !== Token.Value) {
      throw new Error('Expected value');
    }

    let start = true;
    let seenDot = false;
    let tempIndex = index;
    while (tempIndex < pathString.length) {
      const c = pathString.charAt(tempIndex);

      if (!('0' <= c && c <= '9') && (c !== '.' || seenDot) && (c !== '-' || !start) && c !== 'e') {
        // End of value.
        break;
      }

      if (c === '.') {
        seenDot = true;
      }

      start = false;
      if (c === 'e') {
        start = true;
      }
      tempIndex++;
    }

    if (tempIndex === index) {
      throw new Error('Expected value');
    }

    const str = pathString.substring(index, tempIndex);
    index = tempIndex;
    return parseFloat(str);
  };

  let currentPoint: Point;

  const consumePointFn = (isRelative: boolean): Point => {
    let x = consumeValueFn();
    let y = consumeValueFn();
    if (isRelative) {
      x += currentPoint[0];
      y += currentPoint[1];
    }
    return [x, y];
  };

  const commands: Command[] = [];
  let currentControlPoint: Point;
  let lastMovePoint: Point;

  while (index < pathString.length) {
    const commandChar = consumeCommandFn();
    const isRelative = currentToken === Token.RelativeCommand;

    switch (commandChar) {
      case 'M':
      case 'm': {
        let isFirstPoint = true;
        while (advanceToNextTokenFn() === Token.Value) {
          const nextPoint = consumePointFn(isRelative && !!currentPoint);

          if (isFirstPoint) {
            isFirstPoint = false;
            commands.push(newMove(currentPoint, nextPoint));
            lastMovePoint = nextPoint;
          } else {
            commands.push(newLine(currentPoint, nextPoint));
          }

          currentControlPoint = undefined;
          currentPoint = nextPoint;
        }
        break;
      }
      case 'C':
      case 'c': {
        if (!currentPoint) {
          throw new Error('Current point does not exist');
        }

        while (advanceToNextTokenFn() === Token.Value) {
          const cp1 = consumePointFn(isRelative);
          const cp2 = consumePointFn(isRelative);
          const end = consumePointFn(isRelative);
          commands.push(newBezierCurve(currentPoint, cp1, cp2, end));

          currentControlPoint = cp2;
          currentPoint = end;
        }
        break;
      }
      case 'S':
      case 's': {
        if (!currentPoint) {
          throw new Error('Current point does not exist');
        }

        while (advanceToNextTokenFn() === Token.Value) {
          let cp1: Point;
          const cp2 = consumePointFn(isRelative);
          const end = consumePointFn(isRelative);
          if (currentControlPoint) {
            const x = currentPoint[0] + (currentPoint[0] - currentControlPoint[0]);
            const y = currentPoint[1] + (currentPoint[1] - currentControlPoint[1]);
            cp1 = [x, y];
          } else {
            cp1 = cp2;
          }
          commands.push(newBezierCurve(currentPoint, cp1, cp2, end));

          currentControlPoint = cp2;
          currentPoint = end;
        }
        break;
      }
      case 'Q':
      case 'q': {
        if (!currentPoint) {
          throw new Error('Current point does not exist');
        }

        while (advanceToNextTokenFn() === Token.Value) {
          const cp = consumePointFn(isRelative);
          const end = consumePointFn(isRelative);
          commands.push(newQuadraticCurve(currentPoint, cp, end));

          currentControlPoint = cp;
          currentPoint = end;
        }
        break;
      }
      case 'T':
      case 't': {
        if (!currentPoint) {
          throw new Error('Current point does not exist');
        }

        while (advanceToNextTokenFn() === Token.Value) {
          let cp: Point;
          const end = consumePointFn(isRelative);
          if (currentControlPoint) {
            const x = currentPoint[0] + (currentPoint[0] - currentControlPoint[0]);
            const y = currentPoint[1] + (currentPoint[1] - currentControlPoint[1]);
            cp = [x, y];
          } else {
            cp = end;
          }
          commands.push(newQuadraticCurve(currentPoint, cp, end));

          currentControlPoint = cp;
          currentPoint = end;
        }
        break;
      }
      case 'L':
      case 'l': {
        if (!currentPoint) {
          throw new Error('Current point does not exist');
        }

        while (advanceToNextTokenFn() === Token.Value) {
          const end = consumePointFn(isRelative);
          commands.push(newLine(currentPoint, end));

          currentControlPoint = undefined;
          currentPoint = end;
        }
        break;
      }
      case 'H':
      case 'h': {
        if (!currentPoint) {
          throw new Error('Current point does not exist');
        }

        while (advanceToNextTokenFn() === Token.Value) {
          let x = consumeValueFn();
          const y = currentPoint[1];
          if (isRelative) {
            x += currentPoint[0];
          }
          const end: Point = [x, y];
          commands.push(newLine(currentPoint, end));

          currentControlPoint = undefined;
          currentPoint = end;
        }
        break;
      }
      case 'V':
      case 'v': {
        if (!currentPoint) {
          throw new Error('Current point does not exist');
        }

        while (advanceToNextTokenFn() === Token.Value) {
          const x = currentPoint[0];
          let y = consumeValueFn();
          if (isRelative) {
            y += currentPoint[1];
          }
          const end: Point = [x, y];
          commands.push(newLine(currentPoint, end));

          currentControlPoint = undefined;
          currentPoint = end;
        }
        break;
      }
      case 'A':
      case 'a': {
        if (!currentPoint) {
          throw new Error('Current point does not exist');
        }

        while (advanceToNextTokenFn() === Token.Value) {
          const rx = consumeValueFn();
          const ry = consumeValueFn();
          const xAxisRotation = consumeValueFn();
          const largeArcFlag = consumeValueFn();
          const sweepFlag = consumeValueFn();
          const tempPoint1 = consumePointFn(isRelative);

          // Approximate the arc as one or more bezier curves.
          const bezierCoords = arcToBeziers({
            start: currentPoint,
            radius: [rx, ry],
            xAxisRotation,
            largeArcFlag,
            sweepFlag,
            end: tempPoint1,
          });

          for (let i = 0; i < bezierCoords.length; i += 8) {
            const endPoint: Point = [bezierCoords[i + 6], bezierCoords[i + 7]];
            commands.push(
              newBezierCurve(
                currentPoint,
                [bezierCoords[i + 2], bezierCoords[i + 3]],
                [bezierCoords[i + 4], bezierCoords[i + 5]],
                endPoint,
              ),
            );
            currentPoint = endPoint;
          }

          currentControlPoint = undefined;
          currentPoint = tempPoint1;
        }
        break;
      }
      case 'Z':
      case 'z': {
        if (!currentPoint) {
          throw new Error('Current point does not exist');
        }
        commands.push(newClosePath(currentPoint, lastMovePoint));
        currentControlPoint = undefined;
        currentPoint = lastMovePoint;
        break;
      }
    }
  }

  return commands;
}

function newMove(start: Point, end: Point) {
  return Command.create('M', [start, end]);
}

function newLine(start: Point, end: Point) {
  return Command.create('L', [start, end]);
}

function newQuadraticCurve(start: Point, cp: Point, end: Point) {
  return Command.create('Q', [start, cp, end]);
}

function newBezierCurve(start: Point, cp1: Point, cp2: Point, end: Point) {
  return Command.create('C', [start, cp1, cp2, end]);
}

function newClosePath(start: Point, end: Point) {
  return Command.create('Z', [start, end]);
}

interface EllipticalArc {
  start: Point;
  radius: Point;
  xAxisRotation: number;
  largeArcFlag: number;
  sweepFlag: number;
  end: Point;
}

/** Estimates an elliptical arc as a sequence of bezier curves. */
function arcToBeziers(arc: EllipticalArc) {
  const { start, radius, largeArcFlag, sweepFlag, end } = arc;
  const [xf, yf] = start;
  let [rx, ry] = radius;
  const [xt, yt] = end;
  let xAxisRotation = arc.xAxisRotation;

  // Sign of the radii is ignored (behaviour specified by the spec)
  rx = Math.abs(rx);
  ry = Math.abs(ry);

  xAxisRotation = xAxisRotation * Math.PI / 180;
  const cosAngle = Math.cos(xAxisRotation);
  const sinAngle = Math.sin(xAxisRotation);

  // We simplify the calculations by transforming the arc so that the origin is at the
  // midpoint calculated above followed by a rotation to line up the coordinate axes
  // with the axes of the ellipse.

  // Compute the midpoint of the line between the current and the end point
  const dx2 = (xf - xt) / 2;
  const dy2 = (yf - yt) / 2;

  // Step 1 : Compute (x1', y1') - the transformed start point
  const x1 = cosAngle * dx2 + sinAngle * dy2;
  const y1 = -sinAngle * dx2 + cosAngle * dy2;

  let rx_sq = rx * rx;
  let ry_sq = ry * ry;
  const x1_sq = x1 * x1;
  const y1_sq = y1 * y1;

  // Check that radii are large enough.
  // If they are not, the spec says to scale them up so they are.
  // This is to compensate for potential rounding errors/differences between SVG implementations.
  const radiiCheck = x1_sq / rx_sq + y1_sq / ry_sq;
  if (radiiCheck > 1) {
    rx = Math.sqrt(radiiCheck) * rx;
    ry = Math.sqrt(radiiCheck) * ry;
    rx_sq = rx * rx;
    ry_sq = ry * ry;
  }

  // Step 2 : Compute (cx1, cy1) - the transformed centre point
  let sign = largeArcFlag === sweepFlag ? -1 : 1;
  let sq = (rx_sq * ry_sq - rx_sq * y1_sq - ry_sq * x1_sq) / (rx_sq * y1_sq + ry_sq * x1_sq);
  sq = sq < 0 ? 0 : sq;
  const coef = sign * Math.sqrt(sq);
  const cx1 = coef * (rx * y1 / ry);
  const cy1 = coef * -(ry * x1 / rx);

  // Step 3 : Compute (cx, cy) from (cx1, cy1)
  const sx2 = (xf + xt) / 2;
  const sy2 = (yf + yt) / 2;
  const cx = sx2 + (cosAngle * cx1 - sinAngle * cy1);
  const cy = sy2 + (sinAngle * cx1 + cosAngle * cy1);

  // Step 4 : Compute the angleStart (angle1) and the angleExtent (dangle)
  const ux = (x1 - cx1) / rx;
  const uy = (y1 - cy1) / ry;
  const vx = (-x1 - cx1) / rx;
  const vy = (-y1 - cy1) / ry;
  let p, n;

  // Compute the angle start
  n = Math.sqrt(ux * ux + uy * uy);
  p = ux; // (1 * ux) + (0 * uy)
  sign = uy < 0 ? -1 : 1;
  let angleStart = sign * Math.acos(p / n) * 180 / Math.PI;

  // Compute the angle extent
  n = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
  p = ux * vx + uy * vy;
  sign = ux * vy - uy * vx < 0 ? -1 : 1;
  let angleExtent = sign * Math.acos(p / n) * 180 / Math.PI;
  if (!sweepFlag && angleExtent > 0) {
    angleExtent -= 360;
  } else if (sweepFlag && angleExtent < 0) {
    angleExtent += 360;
  }

  angleExtent %= 360;
  angleStart %= 360;

  // Many elliptical arc implementations including the Java2D and Android ones, only
  // support arcs that are axis aligned.  Therefore we need to substitute the arc
  // with bezier curves.  The following method call will generate the beziers for
  // a unit circle that covers the arc angles we want.
  const bezierCoords = unitCircleArcToBeziers(angleStart, angleExtent);

  // Calculate a transformation matrix that will move and scale these bezier points to the correct location.
  // translate(cx, cy) --> rotate(rotate) --> scale(rx, ry)
  for (let i = 0; i < bezierCoords.length; i += 2) {
    // dot product
    const x = bezierCoords[i];
    const y = bezierCoords[i + 1];
    bezierCoords[i] = cosAngle * rx * x + -sinAngle * ry * y + cx;

    bezierCoords[i + 1] = sinAngle * rx * x + cosAngle * ry * y + cy;
  }

  // The last point in the bezier set should match exactly the last coord pair in the arc (ie: x,y). But
  // considering all the mathematical manipulation we have been doing, it is bound to be off by a tiny
  // fraction. Experiments show that it can be up to around 0.00002.  So why don't we just set it to
  // exactly what it ought to be.
  bezierCoords[bezierCoords.length - 2] = xt;
  bezierCoords[bezierCoords.length - 1] = yt;
  return bezierCoords;
}

/*
  * Generate the control points and endpoints for a set of bezier curves that match
  * a circular arc starting from angle 'angleStart' and sweep the angle 'angleExtent'.
  * The circle the arc follows will be centred on (0,0) and have a radius of 1.0.
  *
  * Each bezier can cover no more than 90 degrees, so the arc will be divided evenly
  * into a maximum of four curves.
  *
  * The resulting control points will later be scaled and rotated to match the final
  * arc required.
  *
  * The returned array has the format [x0,y0, x1,y1,...].
  */
function unitCircleArcToBeziers(angleStart: number, angleExtent: number): number[] {
  const numSegments = Math.ceil(Math.abs(angleExtent) / 90);

  angleStart = angleStart * Math.PI / 180;
  angleExtent = angleExtent * Math.PI / 180;

  const angleIncrement = angleExtent / numSegments;

  // The length of each control point vector is given by the following formula.
  const controlLength = 4 / 3 * Math.sin(angleIncrement / 2) / (1 + Math.cos(angleIncrement / 2));

  const coords = new Array(numSegments * 8);
  let pos = 0;

  for (let i = 0; i < numSegments; i++) {
    let angle = angleStart + i * angleIncrement;

    // Calculate the control vector at this angle
    let dx = Math.cos(angle);
    let dy = Math.sin(angle);

    // First point
    coords[pos++] = dx;
    coords[pos++] = dy;

    // First control point
    coords[pos++] = dx - controlLength * dy;
    coords[pos++] = dy + controlLength * dx;

    // Second control point
    angle += angleIncrement;
    dx = Math.cos(angle);
    dy = Math.sin(angle);

    coords[pos++] = dx + controlLength * dy;
    coords[pos++] = dy - controlLength * dx;

    // Endpoint of bezier
    coords[pos++] = dx;
    coords[pos++] = dy;
  }

  return coords;
}
