import { newOctagonData, newSquareDataWithDummyPoints } from './util/data';

import { runShapeToShapeMorph } from './shape-to-shape-morph';

export function run() {
  runShapeToShapeMorph({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newSquareDataWithDummyPoints([3, 3], [6, 6]),
    toData: newOctagonData([13, 1], [18, 6]),
  });
}
