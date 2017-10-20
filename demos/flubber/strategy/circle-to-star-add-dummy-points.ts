import * as d3 from 'lib/d3';

import { addPoints, join } from '../util/common';

import { Command } from 'scripts/paths';
import { DataSelection } from 'scripts/types';
import { Point } from 'scripts/math';
import { create as createViewport } from 'scripts/viewport';
import { pathStringToRing } from '../util/svg';

interface Datum {
  readonly point: Point;
  readonly position: string;
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
  const fromSegments = fromContainer.append('g');

  const toContainer = viewport.append('g.to');
  const toPath = toContainer.append('path').attrs({
    fill: '#d8d8d8',
    stroke: '#000',
    'stroke-width': 2,
    'vector-effect': 'non-scaling-stroke',
  });
  const toSegments = toContainer.append('g');

  const fromPathData =
    'M 6 3 C 7.656 3 9 4.344 9 6 C 9 7.656 7.656 9 6 9 C 4.344 9 3 7.656 3 6 C 3 4.344 4.344 3 6 3 Z';
  const toPathData =
    'M 18 3 L 18.882 4.788 L 20.856 5.07 L 19.428 6.462 L 19.764 8.43 L 18 7.5 L 16.236 8.43 L 16.572 6.462 L 15.144 5.07 L 17.118 4.788 Z';

  const origFromSegments: Datum[] = Command.fromPathData(fromPathData).map((c, i) => {
    return {
      point: c.end,
      position: (i * 12).toString(),
    };
  });
  const origToSegments = Command.fromPathData(toPathData).map((c, i) => {
    let position: number;
    if (i === 0) {
      position = 0;
    } else if (i === 1) {
      position = 5;
    } else if (i === 2) {
      position = 10;
    } else if (i === 3) {
      position = 14;
    } else if (i === 4) {
      position = 19;
    } else if (i === 5) {
      position = 24;
    } else if (i === 6) {
      position = 29;
    } else if (i === 7) {
      position = 34;
    } else if (i === 8) {
      position = 38;
    } else {
      position = 43;
    }
    return {
      point: c.end,
      position: position.toString(),
    };
  });

  fromSegments.datum(origFromSegments).call(updateCircles, '#5761d3', '#5761d3');
  toSegments.datum(origToSegments).call(updateCircles, '#5761d3', '#5761d3');

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
      position: i.toString(),
    };
  });
  const newToSegments = [...toRing].map((p, i) => {
    return {
      point: p,
      position: i.toString(),
    };
  });

  // Pick optimal winding.
  // fromRing = wind(fromRing, toRing);

  fromPath.attrs({ d: join(fromRing) });
  toPath.attrs({ d: join(toRing) });

  d3.timeout(() => {
    fromSegments.datum(newFromSegments).call(updateCircles, '#44eb8a', '#5761d3');
    toSegments.datum(newToSegments).call(updateCircles, '#44eb8a', '#5761d3');
  }, 2000);
}

function updateCircles(selection: DataSelection<Datum[]>, enterColor: string, updateColor: string) {
  // JOIN new data with old elements.
  const segments = selection.selectAll('circle').data(d => d, (d: Datum) => d.position);

  // EXIT old elements not present in new data.
  segments.exit().remove();

  // UPDATE old elements present in new data.
  segments.attrs({
    cx: d => d.point[0],
    cy: d => d.point[1],
    r: 0.075,
    fill: updateColor,
    stroke: '#000',
    'stroke-width': 0.01,
    opacity: 1,
  });

  // ENTER new elements present in new data.
  segments
    .enter()
    .append('circle')
    .attrs({
      cx: d => d.point[0],
      cy: d => d.point[1],
      r: 0.075,
      fill: enterColor,
      stroke: '#000',
      'stroke-width': 0.01,
      opacity: 0,
    })
    .transition()
    .delay((d, i) => i * 20)
    .attrs({ opacity: 1 });
}
