import { newCurveData, newLineData } from './util/data';

import { runShapeToShape } from './util/shape-to-shape';

export function runLineToCurve() {
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newLineData([3, 3], [6, 6]),
    toData: newCurveData([13, 1], [18, 6]),
    strokeDashArray: 15,
  });
}
