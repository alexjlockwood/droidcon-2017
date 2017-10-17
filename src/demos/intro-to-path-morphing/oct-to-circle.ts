import * as Viewport from 'scripts/viewport';
import * as d3 from 'lib/d3';

import {
  Datum,
  newCircleData,
  newCircleDataWithDummyPoints,
  newOctagonData,
  newOctagonDataWithHandles,
} from './util/data';

import { runShapeToShape } from './util/shape-to-shape';

export function runOctToCircle() {
  const shouldMorph = false;
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    from: {
      data: newOctagonData([3, 3], [6, 6]),
      fill: shouldMorph ? '#d8d8d8' : 'none',
      stroke: shouldMorph ? '#000' : '#d8d8d8',
      strokeDasharray: shouldMorph ? 0 : 10,
      interpolateColor: () => '#F44336',
    },
    to: {
      data: newCircleData([13, 1], [18, 6]),
      fill: 'none',
      stroke: '#d8d8d8',
      strokeDasharray: 10,
    },
    shouldMorph,
  });
}

export function runOctToCircleWithDummyPoints() {
  const shouldMorph = false;
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    from: {
      data: newOctagonData([3, 3], [6, 6]),
      fill: shouldMorph ? '#d8d8d8' : 'none',
      stroke: shouldMorph ? '#000' : '#d8d8d8',
      strokeDasharray: shouldMorph ? 0 : 10,
      interpolateColor: () => '#F44336',
    },
    to: {
      data: newCircleDataWithDummyPoints([13, 1], [18, 6]),
      fill: 'none',
      stroke: '#d8d8d8',
      strokeDasharray: 10,
    },
    shouldMorph,
  });
}

export function runOctWithHandlesToCircleWithDummyPoints() {
  octWithHandlesToCircleWithDummyPoints(false);
}

export function runOctWithHandlesToCircleWithDummyPointsMorph() {
  octWithHandlesToCircleWithDummyPoints(true);
}

function octWithHandlesToCircleWithDummyPoints(shouldMorph: boolean) {
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    from: {
      data: newOctagonDataWithHandles([3, 3], [6, 6]),
      hideLabels: shouldMorph,
      fill: shouldMorph ? '#d8d8d8' : 'none',
      stroke: shouldMorph ? '#000' : '#d8d8d8',
      strokeDasharray: shouldMorph ? 0 : 10,
    },
    to: {
      data: newCircleDataWithDummyPoints([13, 1], [18, 6]),
      hideLabels: shouldMorph,
      fill: 'none',
      stroke: '#d8d8d8',
      strokeDasharray: 10,
    },
    shouldMorph,
  });
}
