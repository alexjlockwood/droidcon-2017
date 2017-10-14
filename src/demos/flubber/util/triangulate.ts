import * as d3 from 'lib/d3';

import { Point, Triangle } from 'scripts/math';

export interface Topology {
  type: 'Topology';
  objects: {
    triangles: {
      type: 'GeometryCollection';
      geometries: {
        type: 'Polygon';
        area: number;
        arcs: number[][];
      }[];
    };
  };
  arcs: Point[][];
}

export function createTopology(triangles: Triangle[], points: Point[]) {
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

  // Sort smallest first.
  topology.objects.triangles.geometries.sort((a, b) => a.area - b.area);
  return topology;
}
