import * as Path from 'svgpath';
import * as d3 from 'lib/d3';
import * as topojson from 'topojson-client';

import { Point, Ring, distance } from 'scripts/math';
import { addPoints, join, wind } from '../util/common';

import { DataSelection } from 'scripts/types';

export function run() {
  const svg = d3
    .select('body')
    .append('svg')
    .attrs({ width: 960, height: 500 });
  const path = svg.append('path');
  const circles = svg.append('g');

  d3.json('../../../assets/us.topo.json', (err, topo) => {
    const states = topojson
      .feature(topo, (topo as any).objects.states)
      .features.map((d: any) => d.geometry.coordinates[0]);

    d3.shuffle(states);

    (function draw() {
      let a = states[0].slice(0) as Ring;
      const b = states[1].slice(0) as Ring;

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
    })();
  });
}

function updateCircles(sel: DataSelection<Ring>) {
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
