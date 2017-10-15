import * as Viewport from 'scripts/viewport';
import * as d3 from 'lib/d3';

import { Datum, newCircleData, newOctagonData } from './util/data';

import { runShapeToShape } from './util/demo';

export function run() {
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newOctagonData([3, 3], [6, 6]),
    toData: newCircleData([13, 1], [18, 6]),
  });
}
