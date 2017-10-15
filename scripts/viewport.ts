import * as d3 from 'lib/d3';

import { Point } from './math';

export function create(options: Options) {
  const { size, viewportWidth, viewportHeight } = options;
  const width = viewportWidth >= viewportHeight ? size : size * viewportWidth / viewportHeight;
  const height = viewportWidth >= viewportHeight ? size * viewportHeight / viewportWidth : size;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const scale = { x: width / viewportWidth, y: height / viewportHeight };

  const viewport = d3
    .select('body')
    .append('svg')
    .attrs({
      width: width + margin.left + margin.right,
      height: height + margin.top + margin.bottom,
    })
    .append('g.viewport')
    .attrs({
      transform: `translate(${margin.left}, ${margin.top}) scale(${scale.x}, ${scale.y})`,
    });

  viewport.append('rect.background').attrs({
    x1: 0,
    y1: 0,
    width: viewportWidth,
    height: viewportHeight,
  });

  if (scale.x >= 4 && scale.y >= 4) {
    viewport
      .append('g')
      .selectAll('line.grid')
      .data([
        ...d3.range(viewportWidth + 1).map(x => [[x, 0], [x, viewportHeight]] as [Point, Point]),
        ...d3.range(viewportHeight + 1).map(y => [[0, y], [viewportWidth, y]] as [Point, Point]),
      ])
      .enter()
      .append('line.grid')
      .attrs({
        x1: d => d[0][0],
        y1: d => d[0][1],
        x2: d => d[1][0],
        y2: d => d[1][1],
      });
  }

  return viewport;
}

interface Options {
  readonly size: number;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
}
