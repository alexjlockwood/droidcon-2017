import { ShapeOptions, runShapeToShape } from './util/shape-to-shape';

import { newSquareData } from './util/data';

export function runSqToSq() {
  sqToSq(false);
}

export function runSqToSqMorph() {
  sqToSq(true);
}

function sqToSq(shouldMorph: boolean) {
  const baseShapeOptions: Partial<ShapeOptions> = {
    hideLabels: shouldMorph,
    stroke: '#d8d8d8',
  };
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    from: Object.assign({}, baseShapeOptions, {
      data: newSquareData([3, 3], [6, 6]),
      fill: shouldMorph ? '#d8d8d8' : 'none',
      stroke: shouldMorph ? '#000' : '#d8d8d8',
      strokeDasharray: shouldMorph ? 0 : 10,
    }),
    to: Object.assign({}, baseShapeOptions, {
      data: newSquareData([15, 3], [18, 6]),
      fill: 'none',
      stroke: '#d8d8d8',
      strokeDasharray: 10,
    }),
    shouldMorph,
  });
}
