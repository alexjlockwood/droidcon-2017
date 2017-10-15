import { newSquareData } from './util/data';
import { runShapeToShape } from './shape-to-shape';

export function run() {
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newSquareData([3, 3], [6, 6]),
    toData: newSquareData([15, 3], [18, 6]),
  });
}
