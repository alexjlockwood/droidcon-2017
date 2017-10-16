import {
  newOctagonData,
  newSquareData,
  newSquareDataWithDummyPoints,
  reverseData,
  shiftData,
} from './util/data';
import { runShapeToShape, runShapeToShapeMorph } from './util/shape-to-shape';

import { floorMod } from 'scripts/math';

const viewportOptions = { size: 1440, viewportWidth: 24, viewportHeight: 12 };

export function runSqToOct() {
  sqToOct(false);
}

export function runSqToOctMorph() {
  sqToOct(true);
}

function sqToOct(shouldMorph: boolean) {
  const fn = shouldMorph ? runShapeToShapeMorph : runShapeToShape;
  fn({
    viewportOptions,
    fromData: newSquareData([3, 3], [6, 6]),
    toData: newOctagonData([13, 1], [18, 6]),
    hideLabels: shouldMorph,
  });
}

export function runSqWithDummyPointsToOct() {
  sqWithDummyPointsToOct(false);
}

export function runSqWithDummyPointsToOctMorph() {
  sqWithDummyPointsToOct(true);
}

function sqWithDummyPointsToOct(shouldMorph: boolean) {
  const fn = shouldMorph ? runShapeToShapeMorph : runShapeToShape;
  runShapeToShapeMorph({
    viewportOptions,
    fromData: newSquareDataWithDummyPoints([3, 3], [6, 6]),
    toData: newOctagonData([13, 1], [18, 6]),
    hideLabels: shouldMorph,
  });
}

export function runSqWithDummyPointsToReversedOct() {
  runShapeToShape({
    viewportOptions,
    fromData: newSquareDataWithDummyPoints([3, 3], [6, 6]),
    toData: reverseData(newOctagonData([13, 1], [18, 6])).map((d, i) => {
      return Object.assign({}, d, { labelText: (i + 1).toString() });
    }),
  });
}

export function runSqWithDummyPointsToReversedOctMorph() {
  const origFromData = newSquareDataWithDummyPoints([3, 3], [6, 6]);
  const reversedFromData = origFromData.map((d, i) => {
    const position = d.position === 0 ? 0 : origFromData.length - 1 - (i - 1);
    return Object.assign({}, d, { position });
  });
  const reversedToData = reverseData(newOctagonData([13, 1], [18, 6])).map((d, i) => {
    const position = d.position;
    return Object.assign({}, d, { position, labelText: (position + 1).toString() });
  });
  runShapeToShapeMorph({
    viewportOptions,
    fromData: reversedFromData,
    toData: reversedToData,
    hideLabels: true,
  });
}

export function runSqWithDummyPointsToShiftedOct() {
  const origToData = newOctagonData([13, 1], [18, 6]);
  const shiftedToData = shiftData(origToData, 1).map(d => {
    return Object.assign({}, d, {
      labelText: (floorMod(d.position + 1, origToData.length) + 1).toString(),
    });
  });
  runShapeToShape({
    viewportOptions,
    fromData: newSquareDataWithDummyPoints([3, 3], [6, 6]),
    toData: shiftedToData,
  });
}

export function runSqWithDummyPointsToShiftedOctMorph() {
  const numShifts = -1;
  const origFromData = newSquareDataWithDummyPoints([3, 3], [6, 6]);
  const shiftedFromData = origFromData.map((d, i) => {
    return Object.assign({}, d, {
      position: floorMod(d.position - numShifts, origFromData.length),
    });
  });
  runShapeToShapeMorph({
    viewportOptions,
    fromData: shiftedFromData,
    toData: shiftData(newOctagonData([13, 1], [18, 6]), numShifts),
    hideLabels: true,
  });
}
