import * as d3 from 'lib/d3';

import { Point, Ring, distance } from 'scripts/math';

export function align(a: Ring, b: Ring): [Ring, Ring] {
  // Matching rotation.
  if (d3.polygonArea(a) * d3.polygonArea(b) < 0) {
    a.reverse();
  }

  // Smooth out by bisecting long triangulation cuts.
  bisectSegments(a, 25);
  bisectSegments(b, 25);

  // Same number of points on each ring
  if (a.length < b.length) {
    addPoints(a, b.length - a.length);
  } else if (b.length < a.length) {
    addPoints(b, a.length - b.length);
  }

  // Wind the first to minimize sum-of-squares distance to the second.
  return [wind(a, b), b];
}

export function addPoints(ring: Ring, numPoints: number) {
  const desiredLength = ring.length + numPoints;
  const step = d3.polygonLength(ring) / numPoints;
  let i = 0;
  let cursor = 0;
  let insertAt = step / 2;
  while (ring.length < desiredLength) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    const segment = distance(a, b);
    if (insertAt <= cursor + segment) {
      ring.splice(i + 1, 0, pointBetween(a, b, (insertAt - cursor) / segment));
      insertAt += step;
      continue;
    }
    cursor += segment;
    i++;
  }
}

// TODO: don't modify the points like this (hacky!)
function pointBetween(a: Point, b: Point, pct: number): Point & { added: boolean } {
  const point = [a[0] + (b[0] - a[0]) * pct, a[1] + (b[1] - a[1]) * pct] as Point & {
    added: boolean;
  };
  point.added = true;
  return point;
}

/** Bisect any segment longer than x with an extra point. */
function bisectSegments(ring: Ring, threshold: number) {
  for (let i = 0; i < ring.length - 1; i++) {
    while (distance(ring[i], ring[i + 1]) > threshold) {
      ring.splice(i + 1, 0, pointBetween(ring[i], ring[i + 1], 0.5));
    }
  }
}

export function wind(ring: Ring, vs: Ring) {
  const len = ring.length;
  let min = Infinity;
  let bestOffset: number;
  for (let offset = 0; offset < len; offset++) {
    const s = d3.sum(vs.map((p, i) => Math.pow(distance(ring[(offset + i) % len], p), 2)));
    if (s < min) {
      min = s;
      bestOffset = offset;
    }
  }
  return ring.slice(bestOffset).concat(ring.slice(0, bestOffset));
}

export function closestCentroids(start: Ring[], end: Ring[]) {
  if (start.length > 8) {
    return start.map((d, i) => i);
  }
  return bestOrder(start, end);
}

/** Find ordering of first set that minimizes squared distance between centroid pairs. */
function bestOrder(start: Ring[], end: Ring[]) {
  const distances = start.map(p1 => end.map(p2 => squaredDistance(p1, p2)));
  let min = Infinity;
  let best = start.map((d, i) => i);
  function permute(arr, order = [], sum = 0) {
    for (let i = 0; i < arr.length; i++) {
      const cur = arr.splice(i, 1);
      const dist = distances[cur[0]][order.length];
      if (sum + dist < min) {
        if (arr.length) {
          permute(arr.slice(), order.concat(cur), sum + dist);
        } else {
          min = sum + dist;
          best = order.concat(cur);
        }
      }
      if (arr.length) {
        arr.splice(i, 0, cur[0]);
      }
    }
  }
  permute(best);
  return best;
}

function squaredDistance(p1: Ring, p2: Ring) {
  const d = distance(d3.polygonCentroid(p1), d3.polygonCentroid(p2));
  return d * d;
}

export function join(d: Ring) {
  return 'M' + d.join('L') + 'Z';
}
