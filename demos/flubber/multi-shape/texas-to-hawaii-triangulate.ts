import * as d3 from 'lib/d3';
import * as topojson from 'topojson-client';

import { Point, Ring, Triangle } from 'scripts/math';
import { align, closestCentroids, join } from '../util/common';

import { Topology } from '../util/triangulate';
import { create as createViewport } from 'scripts/viewport';
import earcut from 'earcut';

export function run() {
  const svg = createViewport({
    size: 1440,
    viewportWidth: 960,
    viewportHeight: 500,
  }).append('g');
  const path = d3.geoPath();

  d3
    .queue()
    .defer(d3.json, '../../../assets/TX.json')
    .defer(d3.json, '../../../assets/HI.json')
    .await(ready);

  function ready(err, tx, hi) {
    const points = tx.coordinates[0];
    const vertices = points.reduce((arr, point) => arr.concat(point), []);
    const cuts = earcut(vertices);
    const triangles: Triangle[] = [];

    for (let i = 0, l = cuts.length; i < l; i += 3) {
      // Save each triangle as segments [a, b], [b, c], [c, a]
      triangles.push([[cuts[i], cuts[i + 1]], [cuts[i + 1], cuts[i + 2]], [cuts[i + 2], cuts[i]]]);
    }

    const topology = createTopology(triangles, points);

    svg
      .append('path')
      .datum(tx)
      .attr('class', 'state-background')
      .attr('d', path);

    svg.append('path').attr('class', 'mesh');

    // Asynchronous for demo purposes.
    collapse(topology, 8, done);

    function done(pieces: Ring[]) {
      // Turn MultiPolygon into list of rings.
      const destinations = hi.coordinates.map(poly => poly[0]);

      console.log(pieces, destinations);

      // Get array of tweenable pairs of rings rearrange order of polygons for least movement.
      const pairs = closestCentroids(pieces, destinations)
        .map(i => pieces[i])
        .map((a, i) => align([...a], [...destinations[i]]));

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
      (function mergeSmallestFeature() {
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

          d3.selectAll('.state-background, .merging').remove();

          cb(features.map(f => f.geometry.coordinates[0]));
        }
      })();
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
        if (!(d.direction = !d.direction)) {
          // Show borderless
          p.attr('d', d.outer);
        }
        p.each(morph);
      });
  }

  function createTopology(triangles: Triangle[], points: Point[]) {
    const arcIndices: { [index: string]: number } = {};
    const topology: Topology = {
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
      const geometry: number[] = [];

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
}
