import { newCurveData, newLineData, newLineDataWithHandles } from './util/data';

import { runShapeToShape } from './util/shape-to-shape';

export function runLineToCurve() {
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    from: {
      data: newLineData([3, 3], [6, 6]),
      hideLabels: true,
      stroke: '#d8d8d8',
      interpolateColor: () => '#F44336',
    },
    to: {
      data: newCurveData([13, 1], [18, 6]),
      hideLabels: true,
      stroke: '#d8d8d8',
      interpolateColor: () => '#26A6DB',
    },
    shouldMorph: false,
  });
}

export function runLineWithHandlesToCurve() {
  lineWithHandlesToCurve(false);
}

export function runLineWithHandlesToCurveMorph() {
  lineWithHandlesToCurve(true);
}

function lineWithHandlesToCurve(shouldMorph: boolean) {
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    from: {
      data: newLineDataWithHandles([3, 3], [6, 6]),
      hideLabels: true,
      stroke: '#d8d8d8',
      interpolateColor: () => '#26A6DB',
    },
    to: {
      data: newCurveData([13, 1], [18, 6]),
      hideLabels: true,
      stroke: '#d8d8d8',
      interpolateColor: () => '#26A6DB',
    },
    shouldMorph,
  });
}
