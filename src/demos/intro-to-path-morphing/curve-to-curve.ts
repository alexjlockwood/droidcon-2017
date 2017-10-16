import { runShapeToShape, runShapeToShapeMorph } from './util/shape-to-shape';

import { newCurveData } from './util/data';

export function runCurveToCurve() {
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newCurveData([3, 3], [6, 6]),
    toData: newCurveData([13, 1], [18, 6]),
    strokeDashArray: 15,
  });
}

export function runCurveToCurveMorph() {
  runShapeToShapeMorph({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newCurveData([3, 3], [6, 6]),
    toData: newCurveData([13, 1], [18, 6]),
    hideLabels: true,
    strokeDashArray: 15,
  });
}
