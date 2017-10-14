import * as PathParser from './path-parser';
import * as _ from 'lib/lodash';

import { Point, distance, lerp } from 'scripts/math';

import Bezier from 'bezier-js';
import { SvgChar } from './svgchar';

/**
 * Represents an individual SVG command.
 */
export class Command {
  private readonly bezier: any;

  static create(type: SvgChar, points: ReadonlyArray<Point>) {
    return new Command(type, points, false);
  }

  static fromPathData(pathData: string) {
    return PathParser.parse(pathData);
  }

  static toPathData(cmds: ReadonlyArray<Command>) {
    const tokens: SvgChar[] = [];
    cmds.forEach(cmd => {
      tokens.push(cmd.type);
      const isClosePathCommand = cmd.type === 'Z';
      const pointsToNumberListFunc = (...points: Point[]) =>
        points.reduce((list, p) => [...list, p[0], p[1]], [] as number[]);
      const args = pointsToNumberListFunc(...(isClosePathCommand ? [] : cmd.points.slice(1)));
      tokens.splice(tokens.length, 0, ...args.map(n => Number(n.toFixed(3)).toString()));
    });
    return tokens.join(' ');
  }

  static translate(path: string | ReadonlyArray<Command>, [tx, ty]: Point) {
    const commands = typeof path === 'string' ? Command.fromPathData(path) : path;
    return commands.map(({ type, points, isSplit, bezier }) => {
      points = points.map(p => (p ? [p[0] + tx, p[1] + ty] : p) as Point);
      return new Command(type, points, isSplit, bezier);
    });
  }

  private constructor(
    public readonly type: SvgChar,
    public readonly points: ReadonlyArray<Point>,
    public readonly isSplit: boolean,
    bezier?: any,
  ) {
    this.points = [...points];
    if (!bezier && (type === 'Q' || type === 'C')) {
      this.bezier = new Bezier(points.map(([x, y]) => ({ x, y })));
    }
  }

  get start() {
    return _.first(this.points);
  }

  get end() {
    return _.last(this.points);
  }

  length() {
    switch (this.type) {
      case 'M':
        return 0;
      case 'L':
      case 'Z':
        return distance(_.first(this.points), _.last(this.points));
      case 'Q':
      case 'C':
        return this.bezier.length();
    }
  }

  split(numSplits = 1): Command[] {
    if (numSplits === 0) {
      return [new Command(this.type, this.points, false)];
    }
    if (this.type === 'L' || this.type === 'Z') {
      const [[sx, sy], [ex, ey]] = this.points;
      const cmds: Command[] = [];
      for (let i = 0; i < numSplits + 1; i++) {
        const s: Point = [lerp(sx, ex, i / (numSplits + 1)), lerp(sy, ey, i / (numSplits + 1))];
        const e: Point = [
          lerp(sx, ex, (i + 1) / (numSplits + 1)),
          lerp(sy, ey, (i + 1) / (numSplits + 1)),
        ];
        const type = i === numSplits && this.type === 'Z' ? 'Z' : 'L';
        cmds.push(new Command(type, [s, e], i !== numSplits));
      }
      return cmds;
    }
    if (this.type === 'Q' || this.type === 'C') {
      const splitTimes: number[] = [];
      for (let i = 0; i <= numSplits + 1; i++) {
        splitTimes.push(findTimeByDistance(this.bezier, i / (numSplits + 1)));
      }
      const splitBeziers: any[] = [];
      for (let i = 0; i < splitTimes.length - 1; i++) {
        splitBeziers.push(this.bezier.split(splitTimes[i], splitTimes[i + 1]));
      }
      return splitBeziers.map((bez, i) => {
        const points = bez.points as Array<{ x: number; y: number }>;
        return new Command(
          this.type,
          points.map(({ x, y }) => [x, y] as Point),
          i !== numSplits,
          bez,
        );
      });
    }
    throw new Error(`Cannot split type ${this.type}`);
  }

  canConvertTo(targetType: SvgChar) {
    if (this.type === targetType) {
      return false;
    }
    switch (this.type) {
      case 'L':
        return targetType === 'Q' || targetType === 'C';
      case 'Z':
        return targetType === 'L' || targetType === 'Q' || targetType === 'C';
      case 'Q': {
        return targetType === 'C';
      }
    }
    return false;
  }

  convertTo(type: SvgChar) {
    const [start, end] = this.points;
    switch (this.type) {
      case 'M':
        switch (type) {
          case 'M':
            return new Command(type, [start, end], this.isSplit);
        }
        throw new Error(`Cannot convert type ${this.type} to type ${type}`);
      case 'L':
      case 'Z':
        switch (type) {
          case 'L':
          case 'Z':
            return new Command(type, [start, end], this.isSplit);
          case 'Q': {
            const [sx, sy] = start;
            const [ex, ey] = end;
            const cp: Point = [lerp(sx, ex, 0.5), lerp(sy, ey, 0.5)];
            return new Command(type, [start, cp, end], this.isSplit);
          }
          case 'C': {
            const [sx, sy] = start;
            const [ex, ey] = end;
            const cp1: Point = [lerp(sx, ex, 1 / 3), lerp(sy, ey, 1 / 3)];
            const cp2: Point = [lerp(sx, ex, 2 / 3), lerp(sy, ey, 2 / 3)];
            return new Command(type, [start, cp1, cp2, end], this.isSplit);
          }
        }
        throw new Error(`Cannot convert type ${this.type} to type ${type}`);
      case 'Q':
        switch (type) {
          case 'Q':
            return new Command(type, this.points, this.isSplit);
          case 'C':
            const [qcp0, qcp1, qcp2] = this.points;
            const ccp0 = qcp0;
            const ccp1: Point = [
              qcp0[0] + 2 / 3 * (qcp1[0] - qcp0[0]),
              qcp0[1] + 2 / 3 * (qcp1[1] - qcp0[1]),
            ];
            const ccp2: Point = [
              qcp2[0] + 2 / 3 * (qcp1[0] - qcp2[0]),
              qcp2[1] + 2 / 3 * (qcp1[1] - qcp2[1]),
            ];
            const ccp3 = qcp2;
            return new Command(type, [ccp0, ccp1, ccp2, ccp3], this.isSplit);
        }
        throw new Error(`Cannot convert type ${this.type} to type ${type}`);
      case 'C':
        switch (type) {
          case 'C':
            return new Command(type, this.points, this.isSplit);
        }
        throw new Error(`Cannot convert type ${this.type} to type ${type}`);
    }
  }
}

function findTimeByDistance(bezier: any, dist: number) {
  if (dist < 0 || dist > 1) {
    throw new Error('Invalid distance: ' + dist);
  }
  if (dist === 0 || dist === 1) {
    return dist;
  }
  const originalDistance = dist;
  const epsilon = 0.001;
  const maxDepth = -100;

  const lowToHighRatio = dist / (1 - dist);
  let step = -2;
  while (step > maxDepth) {
    const split = bezier.split(dist);
    const low = split.left.length();
    const high = split.right.length();
    const diff = low - lowToHighRatio * high;
    if (Math.abs(diff) < epsilon) {
      // We found a satisfactory midpoint t value.
      break;
    }
    // Jump half the t-distance in the direction of the bias.
    step = step - 1;
    dist += (diff > 0 ? -1 : 1) * 2 ** step;
  }
  if (step === maxDepth) {
    // TODO: handle degenerate curves!!!!!
    return originalDistance;
  }
  return dist;
}
