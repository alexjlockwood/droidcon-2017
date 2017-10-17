import { newCurveData } from './util/data';
import { runShapeToShape } from './util/shape-to-shape';

export function runCurveToCurve() {
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    from: {
      data: newCurveData([3, 3], [6, 6]),
      hideLabels: true,
      hideHandles: true,
      stroke: '#d8d8d8',
      interpolateColor: () => '#26A6DB',
    },
    to: {
      data: newCurveData([13, 1], [18, 6]),
      hideLabels: true,
      hideHandles: true,
      stroke: '#d8d8d8',
      interpolateColor: () => '#26A6DB',
    },
    shouldMorph: false,
  });
}

export function runCurveWithHandlesToCurveWithHandles() {
  curveWithHandlesToCurveWithHandles(false);
}

export function runCurveWithHandlesToCurveWithHandlesMorph() {
  curveWithHandlesToCurveWithHandles(true);
}

function curveWithHandlesToCurveWithHandles(shouldMorph: boolean) {
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    from: {
      data: newCurveData([3, 3], [6, 6]),
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
