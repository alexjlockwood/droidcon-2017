import { Point } from 'scripts/math';

export interface Data {
  segment: Point;
  label: Point;
  position: number;
}

export function newSquareData(topLeft: Point, center: Point) {
  return newSquareDataWithDummyPoints(topLeft, center)
    .map((d, i) => (i % 2 === 0 ? d : undefined))
    .filter(d => d)
    .map((d, i) => ({ segment: d.segment, label: d.label, position: i }));
}

export function newSquareDataWithDummyPoints(topLeft: Point, center: Point) {
  return newSquareRing(topLeft, center).map((p, i) => {
    const label: Point = [p[0] + getLabelOffsetX(i), p[1] + getLabelOffsetY(i)];
    return { segment: p, label, position: i };
  });
}

function newSquareRing(topLeft: Point, center: Point) {
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

export function newOctagonData(topLeft: Point, center: Point) {
  return newOctagonRing(topLeft, center).map((p, i) => {
    const label: Point = [p[0] + getLabelOffsetX(i), p[1] + getLabelOffsetY(i)];
    return { segment: p, label, position: i };
  });
}

function newOctagonRing(topLeft: Point, center: Point) {
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

function getLabelOffsetX(i: number) {
  return i === 1 || i === 3 ? 0.4 : i === 2 ? 0.6 : i === 5 || i === 7 ? -0.4 : i === 6 ? -0.6 : 0;
}

function getLabelOffsetY(i: number) {
  return i === 1 || i === 7 ? -0.4 : i === 0 ? -0.5 : i === 3 || i === 5 ? 0.4 : i === 4 ? 0.6 : 0;
}
