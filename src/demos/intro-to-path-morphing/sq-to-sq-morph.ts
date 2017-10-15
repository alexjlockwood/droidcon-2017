import { newSquareData } from './util/data';
import { runShapeToShapeMorph } from './shape-to-shape-morph';

export function run() {
  runShapeToShapeMorph({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newSquareData([3, 3], [6, 6]),
    toData: newSquareData([15, 3], [18, 6]),
  });
}
