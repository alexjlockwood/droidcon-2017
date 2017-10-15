import { newOctagonData, newSquareData } from './util/data';

import { runShapeToShape } from './util/demo';

export function run() {
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newSquareData([3, 3], [6, 6]),
    toData: newOctagonData([13, 1], [18, 6]),
  });
}
