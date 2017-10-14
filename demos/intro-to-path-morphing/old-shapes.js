function newLineSegments() {
  return _newLineSegments(false);
}

function newLineSegmentsWithHandles() {
  return _newLineSegments(true);
}

function _newLineSegments(withHandles) {
  const points = [[0, 1], [1, 0], [0, 1]];
  return _newShapeSegments(points, withHandles);
}

function newCurveSegmentsWithHandles(withHandles) {
  const points = [[0, 1], [1, 0], [0, 1]];
  const handleIns = [[0, 1], [0.2, 0], [0.4, 1]];
  const handleOuts = [[0.4, 1], [0.2, 0], [0, 1]];
  return points.map((_, i) => [points[i], handleIns[i], handleOuts[i]]);
}

function newSquareSegments() {
  return _newSquareSegments(false);
}

function newSquareSegmentsWithHandles() {
  return _newSquareSegments(true);
}

function _newSquareSegments(withHandles) {
  const points = [
    [0.5, 0],
    [0.75, 0.25],
    [1, 0.5],
    [0.75, 0.75],
    [0.5, 1],
    [0.25, 0.75],
    [0, 0.5],
    [0.25, 0.25],
  ];
  return _newShapeSegments(points, withHandles);
}

function newOctagonSegments() {
  return _newOctagonSegments(false);
}

function newOctagonSegmentsWithHandles() {
  return _newOctagonSegments(true);
}

function _newOctagonSegments(withHandles) {
  const points = [
    [0.5, 0],
    [0.85355339059, 0.1464466094],
    [1, 0.5],
    [0.85355339059, 0.85355339059],
    [0.5, 1],
    [0.1464466094, 0.85355339059],
    [0, 0.5],
    [0.1464466094, 0.1464466094],
  ];
  return _newShapeSegments(points, withHandles);
}

function _newShapeSegments(points, withHandles) {
  const h1s = points.map((curr, i) => {
    const prev = points[(i - 1 + points.length) % points.length];
    return _pointAlong(prev, curr, withHandles ? 2 / 3 : 1);
  });
  const h2s = points.map((curr, i) => {
    const next = points[(i + 1) % points.length];
    return _pointAlong(curr, next, withHandles ? 1 / 3 : 0);
  });
  return points.map((_, i) => [points[i], h1s[i], h2s[i]]);
}

function newCircleSegmentsWithHandles() {
  const points = [
    [0.5, 0],
    [0.853553391, 0.146446609],
    [1, 0.5],
    [0.853553391, 0.853553391],
    [0.5, 1],
    [0.146446609, 0.853553391],
    [0, 0.5],
    [0.146446609, 0.146446609],
  ];
  const handleIns = [
    [0.361928813, 0],
    [0.763071187, 0.0559644063],
    [1, 0.361928813],
    [0.944035594, 0.763071187],
    [0.638071187, 1],
    [0.236928813, 0.944035594],
    [0, 0.638071187],
    [0.0559644063, 0.236928813],
  ];
  const handleOuts = [
    [0.638071187, 0],
    [0.944035594, 0.236928813],
    [1, 0.638071187],
    [0.763071187, 0.944035594],
    [0.361928813, 1],
    [0.0559644063, 0.763071187],
    [0, 0.361928813],
    [0.236928813, 0.0559644063],
  ];
  return points.map((_, i) => [points[i], handleIns[i], handleOuts[i]]);
}

function transformSegments(segments, s, tx, ty) {
  return segments.map(pts => pts.map(([x, y]) => [x * s + tx, y * s + ty]));
}

function reverseSegments(segments) {
  const first = segments.shift();
  segments.reverse();
  segments.unshift(first);
  return segments;
}

function shiftSegments(segments, numShifts) {
  _.times(numShifts, () => segments.unshift(segments.pop()));
  return segments;
}

/** Linearly interpolates between two points. */
function _pointAlong(a, b, pct) {
  return [a[0] + (b[0] - a[0]) * pct, a[1] + (b[1] - a[1]) * pct];
}
