import * as d3 from 'd3';
import * as topojson from 'topojson';

import { DataSelection, Point } from '../../scripts/types';

import { sum as sumFn } from 'd3-array';

export function run() {
  const svg = d3
    .select('body')
    .append('svg')
    .attrs({ width: 960, height: 500 });
  const path = svg.append('path');
  const circles = svg.append('g');

  d3.json('/assets/us.topo.json', (err, topo) => {
    const states = topojson
      .feature(topo, (topo as any).objects.states)
      .features.map((d: any) => d.geometry.coordinates[0]);

    d3.shuffle(states);

    draw();

    function draw() {
      let a = states[0].slice(0);
      const b = states[1].slice(0);

      // Same number of points on each ring.
      if (a.length < b.length) {
        addPoints(a, b.length - a.length);
      } else if (b.length < a.length) {
        addPoints(b, a.length - b.length);
      }

      // Pick optimal winding.
      a = wind(a, b);

      path.attr('d', join(a));

      // Redraw points.
      circles.datum(a).call(updateCircles);

      // Morph.
      const t = d3.transition(undefined).duration(800);

      path
        .transition(t)
        .on('end', () => {
          states.push(states.shift());
          setTimeout(draw, 100);
        })
        .attr('d', join(b));

      circles
        .selectAll('circle')
        .data(b)
        .transition(t)
        .attrs({ cx: (d: Point) => d[0], cy: (d: Point) => d[1] });
    }
  });
}

function updateCircles(sel: DataSelection<Point[]>) {
  const circles = sel.selectAll('circle').data(d => d);

  const merged = circles
    .enter()
    .append('circle')
    .attr('r', 2)
    .merge(circles);

  merged.classed('added', (d: Point & { added: boolean }) => d.added).attrs({
    cx: d => d[0],
    cy: d => d[1],
  });

  circles.exit().remove();
}

function addPoints(ring: Point[], numPoints: number) {
  const desiredLength = ring.length + numPoints;
  const step = d3.polygonLength(ring) / numPoints;

  let i = 0;
  let cursor = 0;
  let insertAt = step / 2;

  do {
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
  } while (ring.length < desiredLength);
}

function pointBetween(a: Point, b: Point, pct: number): Point & { added: boolean } {
  const point = [a[0] + (b[0] - a[0]) * pct, a[1] + (b[1] - a[1]) * pct] as Point & {
    added: boolean;
  };
  point.added = true;
  return point;
}

function distanceBetween(a: Point, b: Point) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

function join(d: Point[]) {
  return 'M' + d.join('L') + 'Z';
}

function wind(ring: Point[], vs: Point[]) {
  const len = ring.length;
  let min = Infinity;
  let bestOffset: number;

  for (let offset = 0; offset < len; offset++) {
    const s = sumFn(vs.map((p, i) => Math.pow(distanceBetween(ring[(offset + i) % len], p), 2)));
    if (s < min) {
      min = s;
      bestOffset = offset;
    }
  }
  return ring.slice(bestOffset).concat(ring.slice(0, bestOffset));
}
