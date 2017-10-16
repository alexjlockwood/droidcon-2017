import * as Viewport from 'scripts/viewport';
import * as d3 from 'lib/d3';

import {
  Datum,
  newCircleData,
  newCircleDataWithDummyPoints,
  newOctagonData,
  newOctagonDataWithHandles,
} from './util/data';
import { runShapeToShape, runShapeToShapeMorph } from './util/shape-to-shape';

export function runOctToCircle() {
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newOctagonData([3, 3], [6, 6]),
    toData: newCircleData([13, 1], [18, 6]),
    hideHandles: true,
  });
}

export function runOctToCircleWithDummyPoints() {
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newOctagonData([3, 3], [6, 6]),
    toData: newCircleDataWithDummyPoints([13, 1], [18, 6]),
  });
}

export function runOctWithHandlesToCircleWithDummyPoints() {
  octWithHandlesToCircleWithDummyPoints(false);
}

export function runOctWithHandlesToCircleWithDummyPointsMorph() {
  octWithHandlesToCircleWithDummyPoints(true);
}

function octWithHandlesToCircleWithDummyPoints(shouldMorph: boolean) {
  const fn = shouldMorph ? runShapeToShapeMorph : runShapeToShape;
  fn({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newOctagonDataWithHandles([3, 3], [6, 6]),
    toData: newCircleDataWithDummyPoints([13, 1], [18, 6]),
    hideLabels: shouldMorph,
  });
}
