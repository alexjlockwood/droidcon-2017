import { Point } from './types';

export function newSquareRing(topLeft: Point, center: Point) {
  const [tx, ty] = topLeft;
  const [cx, cy] = center;
  const sx = (cx - tx) * 2;
  const sy = (cy - ty) * 2;
  return [
    [0.5, 0],
    [0.75, 0.25],
    [1, 0.5],
    [0.75, 0.75],
    [0.5, 1],
    [0.25, 0.75],
    [0, 0.5],
    [0.25, 0.25],
  ].map(([x, y]) => [x * sx + tx, y * sy + ty] as Point);
}

export function newOctagonRing(topLeft: Point, center: Point) {
  const [tx, ty] = topLeft;
  const [cx, cy] = center;
  const sx = (cx - tx) * 2;
  const sy = (cy - ty) * 2;
  return [
    [0.5, 0],
    [0.854, 0.146],
    [1, 0.5],
    [0.854, 0.854],
    [0.5, 1],
    [0.146, 0.854],
    [0, 0.5],
    [0.146, 0.146],
  ].map(([x, y]) => [x * sx + tx, y * sy + ty] as Point);
}
