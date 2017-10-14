import { Point } from './types';

/** Linearly interpolate between a and b using time t. */
export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Calculates the distance between two points. */
export function distance(p1: Point, p2: Point) {
  return Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
}

/** Returns true if the two points are equal. */
export function arePointsEqual(p1: Point, p2: Point) {
  return p1 && p2 && distance(p1, p2) < 1e-9;
}
