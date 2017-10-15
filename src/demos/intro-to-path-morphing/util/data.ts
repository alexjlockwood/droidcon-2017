import { Point } from 'scripts/math';

export interface Datum {
  readonly segment: Point;
  readonly handleIn?: Point;
  readonly handleOut?: Point;
  readonly label: Point;
  readonly position: number;
}

export function newLineData(topLeft: Point, center: Point): Datum[] {
  const [tx, ty] = topLeft;
  const [cx, cy] = center;
  const sx = (cx - tx) * 2;
  const sy = (cy - ty) * 2;
  const segments: Point[] = [[0, 1], [1, 0], [0, 1]].map(
    ([x, y]) => [x * sx + tx, y * sy + ty] as Point,
  );
  const handleIns: Point[] = [[0, 1], [1, 0], [0, 1]].map(
    ([x, y]) => [x * sx + tx, y * sy + ty] as Point,
  );
  const handleOuts: Point[] = [[0, 1], [1, 0], [0, 1]].map(
    ([x, y]) => [x * sx + tx, y * sy + ty] as Point,
  );
  return segments.map((p, i) => {
    return {
      segment: p,
      handleIn: handleIns[i],
      handleOut: handleOuts[i],
      label: p,
      position: i,
    };
  });
}

export function newCurveData(topLeft: Point, center: Point): Datum[] {
  const [tx, ty] = topLeft;
  const [cx, cy] = center;
  const sx = (cx - tx) * 2;
  const sy = (cy - ty) * 2;
  const segments: Point[] = [[0, 1], [1, 0], [0, 1]].map(
    ([x, y]) => [x * sx + tx, y * sy + ty] as Point,
  );
  const handleIns: Point[] = [[0, 1], [0.2, 0], [0.4, 1]].map(
    ([x, y]) => [x * sx + tx, y * sy + ty] as Point,
  );
  const handleOuts: Point[] = [[0.4, 1], [0.2, 0], [0, 1]].map(
    ([x, y]) => [x * sx + tx, y * sy + ty] as Point,
  );
  return segments.map((p, i) => {
    return {
      segment: p,
      handleIn: handleIns[i],
      handleOut: handleOuts[i],
      label: p,
      position: i,
    };
  });
}

export function newSquareData(topLeft: Point, center: Point): Datum[] {
  return newSquareDataWithDummyPoints(topLeft, center)
    .map((d, i) => (i % 2 === 0 ? d : undefined))
    .filter(d => d)
    .map((d, i) => ({
      segment: d.segment,
      handleIn: d.handleIn,
      handeOut: d.handleOut,
      label: d.label,
      position: i,
    }));
}

export function newSquareDataWithDummyPoints(topLeft: Point, center: Point): Datum[] {
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

export function newOctagonData(topLeft: Point, center: Point): Datum[] {
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

export function newCircleData(topLeft: Point, center: Point): Datum[] {
  const [tx, ty] = topLeft;
  const [cx, cy] = center;
  const sx = (cx - tx) * 2;
  const sy = (cy - ty) * 2;
  const segments: Point[] = [[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]].map(
    ([x, y]) => [x * sx + tx, y * sy + ty] as Point,
  );
  const handleIns: Point[] = [[0.224, 0], [1, 0.224], [0.776, 1], [0, 0.776]].map(
    ([x, y]) => [x * sx + tx, y * sy + ty] as Point,
  );
  const handleOuts: Point[] = [[0.776, 0], [1, 0.776], [0.224, 1], [0, 0.224]].map(
    ([x, y]) => [x * sx + tx, y * sy + ty] as Point,
  );
  return segments.map((p, i) => {
    const label: Point = [p[0] + getLabelOffsetX(i * 2), p[1] + getLabelOffsetY(i * 2)];
    return {
      segment: p,
      handleIn: handleIns[i],
      handleOut: handleOuts[i],
      label,
      position: i,
    };
  });
}

export function newCircleDataWithDummyPoints(topLeft: Point, center: Point): Datum[] {
  const [tx, ty] = topLeft;
  const [cx, cy] = center;
  const sx = (cx - tx) * 2;
  const sy = (cy - ty) * 2;
  const segments: Point[] = [
    [0.5, 0],
    [0.854, 0.146],
    [1, 0.5],
    [0.854, 0.854],
    [0.5, 1],
    [0.146, 0.854],
    [0, 0.5],
    [0.146, 0.146],
  ].map(([x, y]) => [x * sx + tx, y * sy + ty] as Point);
  const handleIns: Point[] = [
    [0.362, 0],
    [0.763, 0.056],
    [1, 0.362],
    [0.944, 0.763],
    [0.638, 1],
    [0.237, 0.944],
    [0, 0.638],
    [0.056, 0.237],
  ].map(([x, y]) => [x * sx + tx, y * sy + ty] as Point);
  const handleOuts: Point[] = [
    [0.638, 0],
    [0.944, 0.237],
    [1, 0.638],
    [0.763, 0.944],
    [0.362, 1],
    [0.056, 0.763],
    [0, 0.362],
    [0.237, 0.056],
  ].map(([x, y]) => [x * sx + tx, y * sy + ty] as Point);
  return segments.map((p, i) => {
    const label: Point = [p[0] + getLabelOffsetX(i), p[1] + getLabelOffsetY(i)];
    return {
      segment: p,
      handleIn: handleIns[i],
      handleOut: handleOuts[i],
      label,
      position: i,
    };
  });
}

function getLabelOffsetX(i: number) {
  return i === 1 || i === 3 ? 0.4 : i === 2 ? 0.6 : i === 5 || i === 7 ? -0.4 : i === 6 ? -0.6 : 0;
}

function getLabelOffsetY(i: number) {
  return i === 1 || i === 7 ? -0.4 : i === 0 ? -0.5 : i === 3 || i === 5 ? 0.4 : i === 4 ? 0.6 : 0;
}
