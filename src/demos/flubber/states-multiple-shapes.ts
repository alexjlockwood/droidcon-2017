import * as d3 from 'lib/d3';
import * as topojson from 'topojson-client';

import { Point, Ring, Triangle, distance, lerp } from 'scripts/math';
import { Topology, createTopology } from './util/triangulate';
import { align, closestCentroids } from './util/common';

import { DataSelection } from 'scripts/types';
import earcut from 'earcut';

export function run() {
  const width = 960;
  const height = 500;
  const svg = d3
    .select('body')
    .append('svg')
    .attrs({ width, height });

  d3.json('../../assets/us.topo.json', (err, us) => {
    const states = topojson
      .feature(us, (us as any).objects.states)
      .features.map(d => d.geometry.coordinates[0]);
    d3.shuffle(states);
    morph(states);
  });

  function morph(states) {
    const source = states.shift();
    const destination = states[0];
    const multi = subdivide(source);
    states.push(source);
    d3
      .queue(1)
      .defer(tween, [source], multi)
      .defer(tween, multi, [destination])
      .await(err => {
        if (err) {
          throw err;
        }
        morph(states);
      });
  }

  function tween(from: Ring[], to: Ring[], cb: () => void) {
    let pairs: [Ring, Ring][];
    if (to.length === 1) {
      pairs = getTweenablePairs(from, triangulate(to[0], from.length));
    } else {
      pairs = getTweenablePairs(triangulate(from[0], to.length), to, true);
    }
    svg
      .call(updatePaths, pairs)
      .selectAll('path')
      .transition()
      .delay(from.length > 1 ? 0 : 400)
      .duration(2500)
      .styles({ fill: (d, i) => (from.length > 1 ? '#ccc' : d3.interpolateCool(i / pairs.length)) })
      .attrTween('d', (d, i) => d3.interpolateString(join(d[0]), join(d[1])))
      .on('end', () => {
        if (to.length === 1) {
          svg
            .call(updatePaths, to)
            .selectAll('path')
            .attr('d', join);
        }
        setTimeout(cb, 0);
      });
  }

  // Given a full-sized ring, return 2 - 6 smaller clones in a dice pattern.
  function subdivide(ring: Ring) {
    const numClones = 2 + Math.floor(Math.random() * 5);
    const bounds = getBounds(ring);
    return d3.range(numClones).map(d => {
      let x0: number;
      let x1: number;
      let y0: number;
      let y1: number;
      if (numClones === 2) {
        x0 = d ? width / 2 : 0;
        x1 = x0 + width / 2;
        y0 = 0;
        y1 = height;
      } else if (numClones === 3) {
        x0 = d * width / 3;
        x1 = x0 + width / 3;
        y0 = d * height / 3;
        y1 = y0 + height / 3;
      } else if (numClones === 4) {
        x0 = (d % 2) * width / 2;
        x1 = x0 + width / 2;
        y0 = d < 2 ? 0 : height / 2;
        y1 = y0 + height / 2;
      } else if (numClones === 5) {
        x0 = (d < 2 ? 0 : d === 2 ? 1 : 2) * width / 3;
        x1 = x0 + width / 3;
        y0 = [0, 1, 0.5, 0, 1][d] * height / 2;
        y1 = y0 + height / 2;
      } else {
        x0 = (d % 3) * width / 3;
        x1 = x0 + width / 3;
        y0 = d < 3 ? 0 : height / 2;
        y1 = y0 + height / 2;
      }
      return ring.map(fitExtent([[x0 + 5, y0 + 5], [x1 - 5, y1 - 5]], bounds));
    });
  }
}

function updatePaths(selection: DataSelection, pairs: [Ring, Ring][]) {
  const paths = selection.selectAll('path').data(pairs);
  paths.enter().append('path');
  paths.exit().remove();
}

function triangulate(ring: Ring, numPieces: number) {
  const vertices = ring.reduce((arr, point) => arr.concat(point), [] as number[]);
  const cuts = earcut(vertices);
  const triangles: Triangle[] = [];
  for (let i = 0; i < cuts.length; i += 3) {
    // Save each triangle as segments [a, b], [b, c], [c, a].
    triangles.push([[cuts[i], cuts[i + 1]], [cuts[i + 1], cuts[i + 2]], [cuts[i + 2], cuts[i]]]);
  }
  return collapse(createTopology(triangles, ring), numPieces);
}

// Merge polygons into neighbors one at a time until only numPieces remain
function collapse(topology: Topology, numPieces: number) {
  const { geometries } = topology.objects.triangles;
  const bisectorFn = d3.bisector(d => (d as any).area).left;

  // Shuffle just for fun.
  while (geometries.length > numPieces) {
    const smallest = geometries[0];
    const neighborIndex = d3.shuffle(topojson.neighbors(geometries)[0])[0] as number;
    const neighbor = geometries[neighborIndex];
    const merged = topojson.mergeArcs(topology, [smallest, neighbor]);

    // MultiPolygon -> Polygon
    merged.area = smallest.area + neighbor.area;
    merged.type = 'Polygon';
    merged.arcs = merged.arcs[0];

    // Delete smallest and its chosen neighbor.
    geometries.splice(neighborIndex, 1);
    geometries.shift();

    // Add new merged shape in sorted order.
    geometries.splice(bisectorFn(geometries, merged.area), 0, merged);
  }

  return topojson
    .feature(topology, topology.objects.triangles)
    .features.map(f => f.geometry.coordinates[0]);
}

function getTweenablePairs(start: Ring[], end: Ring[], out = false) {
  // Rearrange order of polygons for least movement.
  if (out) {
    start = closestCentroids(start, end);
  } else {
    end = closestCentroids(end, start);
  }
  return start.map((a, i) => align([...a], end[i].slice(0)));
}

// Join a ring or array of rings into a path string.
function join(geom) {
  if (typeof geom[0][0] !== 'number') {
    return geom.map(join).join(' ');
  }
  return 'M' + geom.join('L') + 'Z';
}

// Raw fitExtent to avoid some projection stream kinks
function fitExtent(extent: [Point, Point], bounds: [Point, Point]) {
  const w = extent[1][0] - extent[0][0];
  const h = extent[1][1] - extent[0][1];
  const dx = bounds[1][0] - bounds[0][0];
  const dy = bounds[1][1] - bounds[0][1];
  const k = 1 / Math.max(dx / w, dy / h);
  const x = extent[0][0] - k * bounds[0][0] + (w - dx * k) / 2;
  const y = extent[0][1] - k * bounds[0][1] + (h - dy * k) / 2;
  return point => [x + k * point[0], y + k * point[1]];
}

function getBounds(ring: Ring): [Point, Point] {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  ring.forEach(point => {
    if (point[0] < x0) {
      x0 = point[0];
    }
    if (point[0] > x1) {
      x1 = point[0];
    }
    if (point[1] < y0) {
      y0 = point[1];
    }
    if (point[1] > y1) {
      y1 = point[1];
    }
  });
  return [[x0, y0], [x1, y1]];
}
