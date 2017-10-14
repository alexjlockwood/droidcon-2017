import * as d3 from '../../lib/d3';
import * as topojson from 'topojson';

import { bisector as bisectorFn, sum as sumFn } from 'd3-array';

import earcut from 'earcut';

export function run() {
  const svg = d3
    .select('body')
    .append('svg')
    .attrs({ width: 960, height: 500 });
  const path = d3.geoPath();

  d3
    .queue()
    .defer(d3.json, '/assets/TX.json')
    .defer(d3.json, '/assets/HI.json')
    .await(ready);

  function ready(err, tx, hi) {
    const points = tx.coordinates[0];
    const vertices = points.reduce((arr, point) => arr.concat(point), []);
    const cuts = earcut(vertices);
    const triangles = [];
    let topology;

    for (let i = 0, l = cuts.length; i < l; i += 3) {
      // Save each triangle as segments [a, b], [b, c], [c, a]
      triangles.push([[cuts[i], cuts[i + 1]], [cuts[i + 1], cuts[i + 2]], [cuts[i + 2], cuts[i]]]);
    }

    topology = createTopology(triangles, points);

    svg
      .append('path')
      .datum(tx)
      .attr('class', 'background')
      .attr('d', path);

    svg.append('path').attr('class', 'mesh');

    // Asynchronous for demo purposes
    collapse(topology, 8, done);

    function done(pieces) {
      // Turn MultiPolygon into list of rings
      const destinations = hi.coordinates.map(poly => poly[0]);

      // Get array of tweenable pairs of rings
      const pairs = getTweenablePairs(pieces, destinations);

      // Collate the pairs into before/after path strings
      const pathStrings = [
        pairs.map(d => join(d[0])).join(' '),
        pairs.map(d => join(d[1])).join(' '),
      ] as any[] & { outer: string };

      // For showing borderless when rejoined
      pathStrings.outer = join(points);

      svg
        .select('.mesh')
        .attr('d', pathStrings[0])
        .classed('mesh', false)
        .datum(pathStrings)
        .each(morph);
    }
  }

  function morph(d) {
    const path = d3.select(this);

    path
      .transition()
      .delay(d.direction ? 0 : 1000)
      .duration(0)
      .attr('d', d[0])
      .transition()
      .duration(2500)
      .attr('d', d[1])
      .on('end', () => {
        d.reverse();

        // Show borderless
        if (!(d.direction = !d.direction)) {
          path.attr('d', d.outer);
        }

        path.each(morph);
      });
  }

  // Merge polygons into neighbors one at a time until only numPieces remain
  function collapse(topology, numPieces, cb) {
    // Show fragment being merged for demo purposes
    const merging = svg.append('path').attr('class', 'merging');

    const geometries = topology.objects.triangles.geometries;
    const bisector = bisectorFn(d => (d as any).area).left;

    if (geometries.length > numPieces) {
      mergeSmallestFeature();
    }

    // Shuffle just for fun
    function mergeSmallestFeature() {
      const smallest = geometries[0];
      const neighborIndex = d3.shuffle(topojson.neighbors(geometries)[0])[0] as number;
      const neighbor = geometries[neighborIndex];
      const merged = topojson.mergeArcs(topology, [smallest, neighbor]);
      let features;

      // MultiPolygon -> Polygon
      merged.area = smallest.area + neighbor.area;
      merged.type = 'Polygon';
      merged.arcs = merged.arcs[0];

      // Delete smallest and its chosen neighbor
      geometries.splice(neighborIndex, 1);
      geometries.shift();

      // Add new merged shape in sorted order
      geometries.splice(bisector(geometries, merged.area), 0, merged);

      if (geometries.length > numPieces) {
        // Don't bother repainting if we're still on tiny triangles
        if (smallest.area < 50) {
          return mergeSmallestFeature();
        }

        svg
          .select('.mesh')
          .datum(topojson.mesh(topology, topology.objects.triangles))
          .attr('d', path);

        merging.datum(topojson.feature(topology, smallest)).attr('d', path);

        setTimeout(mergeSmallestFeature, 50);
      } else {
        // Merged down to numPieces
        features = topojson.feature(topology, topology.objects.triangles).features;

        d3.selectAll('.background, .merging').remove();

        cb(features.map(f => f.geometry.coordinates[0]));
      }
    }
  }

  function createTopology(triangles, points) {
    const arcIndices = {};
    const topology = {
      type: 'Topology',
      objects: {
        triangles: {
          type: 'GeometryCollection',
          geometries: [],
        },
      },
      arcs: [],
    };

    triangles.forEach(triangle => {
      const geometry = [];

      triangle.forEach((arc, i) => {
        const slug = arc[0] < arc[1] ? arc.join(',') : arc[1] + ',' + arc[0];
        const coordinates = arc.map(pointIndex => points[pointIndex]);

        if (slug in arcIndices) {
          geometry.push(~arcIndices[slug]);
        } else {
          geometry.push((arcIndices[slug] = topology.arcs.length));
          topology.arcs.push(coordinates);
        }
      });

      topology.objects.triangles.geometries.push({
        type: 'Polygon',
        area: Math.abs(d3.polygonArea(triangle.map(d => points[d[0]]))),
        arcs: [geometry],
      });
    });

    // Sort smallest first
    topology.objects.triangles.geometries.sort((a, b) => a.area - b.area);

    return topology;
  }

  function getTweenablePairs(start, end) {
    // Rearrange order of polygons for least movement
    start = closestCentroids(start, end);
    return start.map((a, i) => align(a.slice(0), end[i].slice(0)));
  }

  function align(a, b) {
    // Matching rotation
    if (d3.polygonArea(a) * d3.polygonArea(b) < 0) {
      a.reverse();
    }

    // Smooth out by bisecting long triangulation cuts
    bisectSegments(a, 25);
    bisectSegments(b, 25);

    // Same number of points on each ring
    if (a.length < b.length) {
      addPoints(a, b.length - a.length);
    } else if (b.length < a.length) {
      addPoints(b, a.length - b.length);
    }

    // Wind the first to minimize sum-of-squares distance to the second
    return [wind(a, b), b];
  }

  function addPoints(ring, numPoints) {
    const desiredLength = ring.length + numPoints,
      step = d3.polygonLength(ring) / numPoints;

    let i = 0;
    let cursor = 0;
    let insertAt = step / 2;

    while (ring.length < desiredLength) {
      const a = ring[i];
      const b = ring[(i + 1) % ring.length];

      const segment = distanceBetween(a, b);

      if (insertAt <= cursor + segment) {
        ring.splice(i + 1, 0, pointBetween(a, b, (insertAt - cursor) / segment));
        insertAt += step;
        continue;
      }

      cursor += segment;
      i++;
    }
  }

  function wind(ring, vs) {
    const len = ring.length;
    let min = Infinity;
    let bestOffset;

    for (let offset = 0; offset < len; offset++) {
      const sum = sumFn(
        vs.map((p, i) => {
          const distance = distanceBetween(ring[(offset + i) % len], p);
          return distance * distance;
        }),
      );

      if (sum < min) {
        min = sum;
        bestOffset = offset;
      }
    }

    return ring.slice(bestOffset).concat(ring.slice(0, bestOffset));
  }

  // Find ordering of first set that minimizes squared distance between centroid pairs
  // Could loosely optimize instead of trying every permutation (would probably have to with 10+ pieces)
  function closestCentroids(start, end) {
    let min = Infinity;
    let best;
    const distances = start.map(p1 => {
      return end.map(p2 => {
        const distance = distanceBetween(d3.polygonCentroid(p1), d3.polygonCentroid(p2));
        return distance * distance;
      });
    });

    function permute(arr, order = [], sum = 0) {
      let cur;
      let distance;

      for (let i = 0; i < arr.length; i++) {
        cur = arr.splice(i, 1);
        distance = distances[cur[0]][order.length];
        if (arr.length) {
          permute(arr.slice(), order.concat(cur), sum + distance);
          arr.splice(i, 0, cur[0]);
        } else if (sum + distance < min) {
          min = sum + distance;
          best = order.concat(cur);
        }
      }
    }

    permute(d3.range(start.length));
    return best.map(i => start[i]);
  }

  function bisectSegments(ring, threshold) {
    for (let i = 0; i < ring.length - 1; i++) {
      while (distanceBetween(ring[i], ring[i + 1]) > threshold) {
        ring.splice(i + 1, 0, pointBetween(ring[i], ring[i + 1], 0.5));
      }
    }
  }

  function distanceBetween(a, b) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];

    return Math.sqrt(dx * dx + dy * dy);
  }

  function pointBetween(a, b, pct) {
    return [a[0] + (b[0] - a[0]) * pct, a[1] + (b[1] - a[1]) * pct];
  }

  function join(ring) {
    return 'M' + ring.join('L') + 'Z';
  }
}
