import { runShapeToShape, runShapeToShapeMorph } from './util/shape-to-shape';

import { newSquareData } from './util/data';

export function runSqToSq() {
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newSquareData([3, 3], [6, 6]),
    toData: newSquareData([15, 3], [18, 6]),
  });
}

export function runSqToSqMorph() {
  runShapeToShapeMorph({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newSquareData([3, 3], [6, 6]),
    toData: newSquareData([15, 3], [18, 6]),
  });
}
