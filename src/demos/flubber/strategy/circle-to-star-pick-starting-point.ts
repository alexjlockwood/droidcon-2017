import * as d3 from 'lib/d3';

import { addPoints, join } from '../util/common';

import { DataSelection } from 'scripts/types';
import { Point } from 'scripts/math';
import { create as createViewport } from 'scripts/viewport';
import { pathStringToRing } from '../util/svg';

interface Datum {
  readonly point: Point;
  readonly position: number;
}

export function run() {
  const viewport = createViewport({
    size: 1440,
    viewportWidth: 24,
    viewportHeight: 12,
  });

  const fromContainer = viewport.append('g.from');
  const fromPath = fromContainer.append('path').attrs({
    fill: '#d8d8d8',
    stroke: '#000',
    'stroke-width': 2,
    'vector-effect': 'non-scaling-stroke',
  });

  const toContainer = viewport.append('g.to');
  const toPath = toContainer.append('path').attrs({
    fill: '#d8d8d8',
    stroke: '#000',
    'stroke-width': 2,
    'vector-effect': 'non-scaling-stroke',
  });

  const linesContainer = viewport.append('g');
  const fromSegments = fromContainer.append('g');
  const toSegments = toContainer.append('g');

  const fromPathData =
    'M 6 3 C 7.656 3 9 4.344 9 6 C 9 7.656 7.656 9 6 9 C 4.344 9 3 7.656 3 6 C 3 4.344 4.344 3 6 3 Z';
  const toPathData =
    'M 18 3 L 18.882 4.788 L 20.856 5.07 L 19.428 6.462 L 19.764 8.43 L 18 7.5 L 16.236 8.43 L 16.572 6.462 L 15.144 5.07 L 17.118 4.788 Z';

  const fromRing = [...pathStringToRing(fromPathData, 0.4).ring];
  const toRing = [...pathStringToRing(toPathData, 0.4).ring];

  // Same number of points on each ring.
  if (fromRing.length < toRing.length) {
    addPoints(fromRing, toRing.length - fromRing.length);
  } else if (toRing.length < fromRing.length) {
    addPoints(toRing, fromRing.length - toRing.length);
  }

  const newFromSegments = [...fromRing].map((p, i) => {
    return {
      point: p,
      position: i,
    };
  });
  const newToSegments = [...toRing].map((p, i) => {
    return {
      point: p,
      position: i,
    };
  });

  fromPath.attrs({ d: join(fromRing) });
  toPath.attrs({ d: join(toRing) });

  linesContainer.call(updateLines, newFromSegments, newToSegments);
  fromSegments.call(updateCircles, newFromSegments);
  toSegments.call(updateCircles, newToSegments);

  let shiftOffset = 0;
  d3.timeout(function recurseFn() {
    shiftOffset = (shiftOffset + 1) % newToSegments.length;
    const data = newToSegments.map((d, i) => {
      const datum = newToSegments[(i + shiftOffset) % newToSegments.length];
      return {
        point: datum.point,
        position: datum.position,
      };
    });
    linesContainer.call(updateLines, newFromSegments, data);
    toSegments.call(updateCircles, data);
    if (shiftOffset !== 0) {
      d3.timeout(recurseFn, 50);
    }
  }, 500);
}

function updateCircles(selection: DataSelection, data: Datum[]) {
  // JOIN new data with old elements.
  const segments = selection
    .datum(data)
    .selectAll('circle')
    .data(d => d, (d: Datum) => d.position.toString());

  // EXIT old elements not present in new data.
  segments.exit().remove();

  // UPDATE old elements present in new data.
  segments.attrs({
    cx: d => d.point[0],
    cy: d => d.point[1],
    r: 0.075,
    fill: (d, i) => interpolateColor(i, data.length),
    stroke: '#000',
    'stroke-width': 0.01,
    // opacity: 1,
  });

  // ENTER new elements present in new data.
  segments
    .enter()
    .append('circle')
    .attrs({
      cx: d => d.point[0],
      cy: d => d.point[1],
      r: 0.075,
      fill: (d, i) => interpolateColor(i, data.length),
      stroke: '#000',
      'stroke-width': 0.01,
      // opacity: 0,
    });
}

function updateLines(selection: DataSelection, fromData: Datum[], toData: Datum[]) {
  const data = d3.zip(fromData, toData);

  // JOIN new data with old elements.
  const lines = selection
    .datum(data)
    .selectAll('line')
    .data(d => d, d => d[0].position + ',' + d[1].position);

  // EXIT old elements not present in new data.
  lines.exit().remove();

  // UPDATE old elements present in new data.
  lines.attrs({
    x1: d => d[0].point[0],
    y1: d => d[0].point[1],
    x2: d => d[1].point[0],
    y2: d => d[1].point[1],
    fill: 'none',
    stroke: '#222',
    'stroke-width': 0.015,
    'stroke-dasharray': 0.1,
  });

  // ENTER new elements present in new data.
  lines
    .enter()
    .append('line')
    .attrs({
      x1: d => d[0].point[0],
      y1: d => d[0].point[1],
      x2: d => d[1].point[0],
      y2: d => d[1].point[1],
      fill: 'none',
      stroke: '#222',
      'stroke-width': 0.015,
      'stroke-dasharray': 0.1,
    });
}

function interpolateColor(index: number, length: number) {
  index = (index + length) % length;
  return d3.interpolateCool(index / length * 0.7 + 0.15);
}
