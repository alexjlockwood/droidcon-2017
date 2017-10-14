import * as d3 from 'lib/d3';

import { Ring, distance, isFiniteNumber, lerp, samePoint } from 'scripts/math';

import { pathStringToRing } from './svg';

export default function normalizeRing(ring: string | Ring, maxSegmentLength: number) {
  let points, area, skipBisect;

  if (typeof ring === 'string') {
    const converted = pathStringToRing(ring, maxSegmentLength);
    ring = converted.ring;
    skipBisect = converted.skipBisect;
  } else if (!Array.isArray(ring)) {
    throw new TypeError('Invalid input');
  }

  points = ring.slice(0);

  if (!validRing(points)) {
    throw new TypeError('Invalid input');
  }

  // TODO skip this test to avoid scale issues?
  // Chosen epsilon (1e-6) is problematic for small coordinate range
  if (points.length > 1 && samePoint(points[0], points[points.length - 1])) {
    points.pop();
  }

  area = d3.polygonArea(points);

  // Make all rings clockwise
  if (area > 0) {
    points.reverse();
  }

  if (!skipBisect && maxSegmentLength && isFiniteNumber(maxSegmentLength) && maxSegmentLength > 0) {
    bisect(points, maxSegmentLength);
  }

  return points;
}

function validRing(ring: Ring) {
  return ring.every(point => {
    return (
      Array.isArray(point) &&
      point.length >= 2 &&
      isFiniteNumber(point[0]) &&
      isFiniteNumber(point[1])
    );
  });
}

function bisect(ring: Ring, maxSegmentLength = Infinity) {
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    let b = i === ring.length - 1 ? ring[0] : ring[i + 1];

    // Could splice the whole set for a segment instead, but a bit messy.
    while (distance(a, b) > maxSegmentLength) {
      b = lerp(a, b, 0.5);
      ring.splice(i + 1, 0, b);
    }
  }
}
