import { newOctagonData, newSquareData, newSquareDataWithDummyPoints } from './util/data';
import { runShapeToShape, runShapeToShapeMorph } from './util/shape-to-shape';

export function runSqToOct() {
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newSquareData([3, 3], [6, 6]),
    toData: newOctagonData([13, 1], [18, 6]),
  });
}

export function runSqToOctMorph() {
  runShapeToShapeMorph({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newSquareData([3, 3], [6, 6]),
    toData: newOctagonData([13, 1], [18, 6]),
  });
}

export function runSqWithDummyPointsToOct() {
  runShapeToShape({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newSquareDataWithDummyPoints([3, 3], [6, 6]),
    toData: newOctagonData([13, 1], [18, 6]),
  });
}

export function runSqWithDummyPointsToOctMorph() {
  runShapeToShapeMorph({
    viewportOptions: { size: 1440, viewportWidth: 24, viewportHeight: 12 },
    fromData: newSquareDataWithDummyPoints([3, 3], [6, 6]),
    toData: newOctagonData([13, 1], [18, 6]),
    hideLabels: true,
  });
}
