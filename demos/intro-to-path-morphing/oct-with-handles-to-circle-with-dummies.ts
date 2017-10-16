import * as Viewport from 'scripts/viewport';
import * as d3 from 'lib/d3';

import { Datum, newCircleDataWithDummyPoints, newOctagonDataWithHandles } from './util/data';

import { runShapeToShape } from './util/demo';

export function run() {
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newOctagonDataWithHandles([3, 3], [6, 6]),
    toData: newCircleDataWithDummyPoints([13, 1], [18, 6]),
  });
}
