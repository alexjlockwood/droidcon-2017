import * as d3 from 'lib/d3';

import { addPoints, join, wind } from '../util/common';
import { buffalo, circle, elephant, hippo, star } from 'scripts/shapes';

import { DataSelection } from 'scripts/types';
import { Point } from 'scripts/math';
import { create as createViewport } from 'scripts/viewport';
import { pathStringToRing } from '../util/svg';

export function run() {
  const viewport = createViewport({
    size: 1440,
    viewportWidth: 820,
    viewportHeight: 570,
  });
  const path = viewport.append('path');
  const circles = viewport.append('g');

  const shapes = [elephant, hippo, buffalo, circle, hippo, star, circle].map(
    d => pathStringToRing(d).ring,
  );

  (function draw() {
    let a = [...shapes[0]];
    const b = [...shapes[1]];

    // Same number of points on each ring.
    if (a.length < b.length) {
      addPoints(a, b.length - a.length);
    } else if (b.length < a.length) {
      addPoints(b, a.length - b.length);
    }

    // Pick optimal winding.
    a = wind(a, b);

    path.attrs({ d: join(a) });

    // Redraw points.
    circles.datum(a).call(updateCircles);

    // Morph.
    const t = d3.transition(undefined).duration(1600);

    path
      .transition(t)
      .on('end', () => {
        shapes.push(shapes.shift());
        setTimeout(draw, 400);
      })
      .attrs({ d: join(b) });

    circles
      .selectAll('circle')
      .data(b)
      .transition(t)
      .attrs({ cx: d => d[0], cy: d => d[1] });
  })();
}

function updateCircles(sel: DataSelection<Point[]>) {
  const circles = sel.selectAll('circle').data(d => d);

  const merged = circles
    .enter()
    .append('circle')
    .attr('r', 3)
    .merge(circles);

  merged.classed('added', (d: Point & { added: boolean }) => d.added).attrs({
    cx: d => d[0],
    cy: d => d[1],
  });

  circles.exit().remove();
}
