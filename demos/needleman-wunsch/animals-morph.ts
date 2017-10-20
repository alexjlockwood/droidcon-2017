import * as d3 from 'lib/d3';

import { AutoAwesome, Command } from 'scripts/paths';
import { buffalo, elephant, hippo } from 'scripts/shapes';

import { DataSelection } from 'scripts/types';
import { Point } from 'scripts/math';
import { create as createViewport } from 'scripts/viewport';

export function run() {
  const viewport = createViewport({
    size: 1440,
    viewportWidth: 820,
    viewportHeight: 570,
  });
  const path = viewport.append('path');
  const circles = viewport.append('g');
  const shapes = [hippo, elephant, buffalo].map(d => Command.fromPathData(d));

  (function draw() {
    const fixResult = AutoAwesome.fix({ from: [...shapes[0]], to: [...shapes[1]] });
    const b: Datum[] = fixResult.to.map(cmd => ({ point: cmd.end, isSplit: cmd.isSplit }));
    const a: Datum[] = fixResult.from.map((cmd, i) => ({ point: cmd.end, isSplit: b[i].isSplit }));

    path.attrs({ d: Command.toPathData(fixResult.from) });
    circles.datum(a).call(updateCircles);

    const t = d3.transition(undefined).duration(800);
    path
      .transition(t)
      .on('end', () => {
        shapes.push(shapes.shift());
        setTimeout(draw, 200);
      })
      .attrs({ d: Command.toPathData(fixResult.to) });

    circles
      .selectAll('circle')
      .data(b)
      .transition(t)
      .attrs({
        cx: d => d.point[0],
        cy: d => d.point[1],
      });
  })();
}

function updateCircles(sel: DataSelection<Datum[]>) {
  const circles = sel.selectAll('circle').data(d => d);
  circles
    .enter()
    .append('circle')
    .attrs({ r: 3 })
    .merge(circles)
    .attrs({
      cx: d => d.point[0],
      cy: d => d.point[1],
      fill: d => (d.isSplit ? '#44f470' : '#5761d3'),
    });
  circles.exit().remove();
}

interface Datum {
  readonly point: Point;
  readonly isSplit?: boolean;
}
