import { newCurveData } from './util/data';
import { runShapeToShapeMorph } from './util/demo';

export function run() {
  runShapeToShapeMorph({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newCurveData([3, 3], [6, 6]),
    toData: newCurveData([13, 1], [18, 6]),
    hideLabels: true,
    strokeDashArray: 15,
  });
}
