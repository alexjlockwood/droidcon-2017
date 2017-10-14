export type Point = [number, number];
export type Triangle = [Point, Point, Point];
export type Ring = Point[];

/** Linearly interpolate between a and b using time t. */
export function lerp(a: number, b: number, t: number): number;
export function lerp(a: Point, b: Point, t: number): Point;
export function lerp(a: number | Point, b: number | Point, t: number): number | Point {
  if (typeof a === 'number' && typeof b === 'number') {
    return a + (b - a) * t;
  } else {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
}

/** Calculates the distance between two points. */
export function distance(p1: Point, p2: Point) {
  return Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
}

/** Returns true if the two points are equal. */
export function samePoint(p1: Point, p2: Point) {
  return p1 && p2 && distance(p1, p2) < 1e-9;
}

/** Returns true iff the given argument is a finite number. */
export function isFiniteNumber(num: any) {
  return typeof num === 'number' && isFinite(num);
}
