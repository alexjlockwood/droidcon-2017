import * as SvgPath from 'svgpath';

import { Ring, isFiniteNumber } from 'scripts/math';

import normalizeRing from './normalize';

type SvgPath = typeof SvgPath;

export function toPathString(ring: Ring) {
  return 'M' + ring.join('L') + 'Z';
}

export function splitPathString(str: string) {
  return split(parse(str));
}

export function pathStringToRing(
  pathData: string,
  maxSegmentLength = 10,
): { ring: Ring; skipBisect?: boolean } {
  const parsed = parse(pathData);
  return exactRing(parsed) || approximateRing(parsed, maxSegmentLength);
}

function exactRing(parsed: SvgPath) {
  const segments = (parsed as any).segments || [];
  const ring: Ring = [];

  if (!segments.length || segments[0][0] !== 'M') {
    return undefined;
  }

  for (let i = 0; i < segments.length; i++) {
    const [command, x, y] = segments[i];
    if ((command === 'M' && i) || command === 'Z') {
      break;
    } else if (command === 'M' || command === 'L') {
      ring.push([x, y]);
    } else if (command === 'H') {
      ring.push([x, ring[ring.length - 1][1]]);
    } else if (command === 'V') {
      ring.push([ring[ring.length - 1][0], x]);
    } else {
      return undefined;
    }
  }

  return ring.length ? { ring } : undefined;
}

function approximateRing(parsed: SvgPath, maxSegmentLength: number) {
  const ringPath = split(parsed)[0];
  const ring: Ring = [];
  let len: number;
  let m: SVGPathElement;
  let numPoints = 3;

  if (!ringPath) {
    throw new TypeError('Invalid input');
  }

  m = measure(ringPath);
  len = m.getTotalLength();

  if (maxSegmentLength && isFiniteNumber(maxSegmentLength) && maxSegmentLength > 0) {
    numPoints = Math.max(numPoints, Math.ceil(len / maxSegmentLength));
  }

  for (let i = 0; i < numPoints; i++) {
    const p = m.getPointAtLength(len * i / numPoints);
    ring.push([p.x, p.y]);
  }

  return { ring, skipBisect: true };
}

function measure(d: string) {
  const path = window.document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttributeNS(undefined, 'd', d);
  return path;
}

function parse(pathData: string) {
  // TODO: fix this hack around the typescript compiler!
  return new SvgPath['default'](pathData).abs();
}

function split(parsed: SvgPath) {
  return parsed
    .toString()
    .split('M')
    .map((d, i) => {
      d = d.trim();
      return i && d ? 'M' + d : d;
    })
    .filter(d => d);
}
