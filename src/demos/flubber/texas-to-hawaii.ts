import * as d3 from 'lib/d3';
import * as topojson from 'topojson-client';

import { addPoints, closestCentroids, join, wind } from './util/common';
import { distance, lerp } from 'scripts/math';

import { Topology } from './util/triangulate';
import earcut from 'earcut';

export function run() {
  const svg = d3
    .select('body')
    .append('svg')
    .attrs({ width: 960, height: 500 });
  const path = d3.geoPath();

  d3
    .queue()
    .defer(d3.json, '../../assets/TX.json')
    .defer(d3.json, '../../assets/HI.json')
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

    // Asynchronous for demo purposes.
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

  // Merge polygons into neighbors one at a time until only numPieces remain!
  function collapse(topology: Topology, numPieces: number, cb: (...args: any[]) => void) {
    // Show fragment being merged for demo purposes
    const merging = svg.append('path').attr('class', 'merging');

    const geometries = topology.objects.triangles.geometries;
    const bisectorFn = d3.bisector(d => (d as any).area).left;

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
      geometries.splice(bisectorFn(geometries, merged.area), 0, merged);

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

  function morph(d) {
    const p = d3.select(this);

    p
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
          p.attr('d', d.outer);
        }

        p.each(morph);
      });
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
          // tslint:disable-next-line no-bitwise
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

  function bisectSegments(ring, threshold) {
    for (let i = 0; i < ring.length - 1; i++) {
      while (distance(ring[i], ring[i + 1]) > threshold) {
        ring.splice(i + 1, 0, lerp(ring[i], ring[i + 1], 0.5));
      }
    }
  }
}
