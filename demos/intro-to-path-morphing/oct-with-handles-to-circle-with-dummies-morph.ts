import { newCircleDataWithDummyPoints, newOctagonDataWithHandles } from './util/data';

import { runShapeToShapeMorph } from './util/demo';

export function run() {
  runShapeToShapeMorph({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newOctagonDataWithHandles([3, 3], [6, 6]),
    toData: newCircleDataWithDummyPoints([13, 1], [18, 6]),
    hideLabels: true,
  });
}
