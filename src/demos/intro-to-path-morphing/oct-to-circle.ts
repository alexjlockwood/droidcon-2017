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
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newOctagonDataWithHandles([3, 3], [6, 6]),
    toData: newCircleDataWithDummyPoints([13, 1], [18, 6]),
  });
}

export function runOctWithHandlesToCircleWithDummyPointsMorph() {
  runShapeToShapeMorph({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newOctagonDataWithHandles([3, 3], [6, 6]),
    toData: newCircleDataWithDummyPoints([13, 1], [18, 6]),
    hideLabels: true,
  });
}
