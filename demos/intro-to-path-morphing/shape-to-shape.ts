import * as d3 from 'lib/d3';

import { Datum, newOctagonData, newSquareData } from './util/data';
import { Options as ViewportOptions, create as createViewport } from 'scripts/viewport';

import { DataSelection } from 'scripts/types';
import { Point } from 'scripts/math';

export interface Options {
  readonly viewportOptions: ViewportOptions;
  readonly fromData: Datum[];
  readonly toData: Datum[];
}

export function runShapeToShape(options: Options) {
  const { viewportOptions, fromData, toData } = options;

  const pixelRatio =
    viewportOptions.size / Math.max(viewportOptions.viewportWidth, viewportOptions.viewportHeight);
  const viewport = createViewport(viewportOptions);
  const fromContainer = viewport.append('g.from');
  const toContainer = viewport.append('g.to');

  fromContainer
    .append('path.outlined')
    .datum(fromData)
    .attrs({ d: d => 'M' + d.map(({ segment }) => segment).join('L') + 'Z' });

  toContainer
    .append('path.outlined')
    .datum(toData)
    .attrs({ d: d => 'M' + d.map(({ segment }) => segment).join('L') + 'Z' });

  // The initial display.
  update(fromContainer, fromData);
  update(toContainer, toData);

  function update(container: DataSelection, data: Datum[]) {
    const t = d3.transition(undefined).duration(500);

    // JOIN new data with old elements.
    const keyFn = (d: Datum) => d.position.toString();
    const segments = container.selectAll('circle.segment').data(data, keyFn);
    const labels = container.selectAll('text.label').data(data, keyFn);

    // EXIT old elements not present in new data.
    segments.exit().remove();
    labels.exit().remove();

    // UPDATE old elements present in new data.
    segments.transition(t).attrs({
      cx: d => d.segment[0],
      cy: d => d.segment[1],
      fill: (d, i) => d3.interpolateCool(i / data.length * 0.7 + 0.15),
    });
    labels.transition(t).attrs({ x: d => d.label[0], y: d => d.label[1] });

    // ENTER new elements present in new data.
    segments
      .enter()
      .append('circle.segment')
      .attrs({
        cx: d => d.segment[0],
        cy: d => d.segment[1],
        r: () => 0.2,
        fill: (d, i) => d3.interpolateCool(i / data.length * 0.7 + 0.15),
      });
    labels
      .enter()
      .append('text.label')
      .text(d => d.position + 1)
      .attrs({
        x: d => d.label[0],
        y: d => d.label[1],
        'font-family': 'Roboto',
        'alignment-baseline': 'middle',
        'text-anchor': 'middle',
        'font-size': 36 / pixelRatio,
      });
  }
}
