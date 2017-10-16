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
  runShapeToShape({
    viewportOptions,
    fromData: newSquareData([3, 3], [6, 6]),
    toData: newOctagonData([13, 1], [18, 6]),
  });
}

export function runSqToOctMorph() {
  runShapeToShapeMorph({
    viewportOptions,
    fromData: newSquareData([3, 3], [6, 6]),
    toData: newOctagonData([13, 1], [18, 6]),
  });
}

export function runSqWithDummyPointsToOct() {
  runShapeToShape({
    viewportOptions,
    fromData: newSquareDataWithDummyPoints([3, 3], [6, 6]),
    toData: newOctagonData([13, 1], [18, 6]),
  });
}

export function runSqWithDummyPointsToOctMorph() {
  runShapeToShapeMorph({
    viewportOptions,
    fromData: newSquareDataWithDummyPoints([3, 3], [6, 6]),
    toData: newOctagonData([13, 1], [18, 6]),
    hideLabels: true,
  });
}

export function runSqWithDummyPointsToReversedOct() {
  const origToData = newOctagonData([13, 1], [18, 6]);
  const reversedToData = reverseData(origToData).map((d, i) => {
    const position = d.position === 0 ? 0 : origToData.length - 1 - (i - 1);
    return Object.assign({}, d, {
      position: position,
      labelText: (i + 1).toString(),
    });
  });
  runShapeToShape({
    viewportOptions,
    fromData: newSquareDataWithDummyPoints([3, 3], [6, 6]),
    toData: reversedToData,
  });
}

export function runSqWithDummyPointsToReversedOctMorph() {
  const origFromData = newSquareDataWithDummyPoints([3, 3], [6, 6]);
  const reversedFromData = origFromData.map((d, i) => {
    const position = d.position === 0 ? 0 : origFromData.length - 1 - (i - 1);
    return Object.assign({}, d, {
      position: position,
    });
  });
  const origToData = newOctagonData([13, 1], [18, 6]);
  const reversedToData = reverseData(origToData).map((d, i) => {
    const position = d.position;
    return Object.assign({}, d, {
      position: position,
      labelText: (position + 1).toString(),
    });
  });
  runShapeToShapeMorph({
    viewportOptions,
    fromData: reversedFromData,
    toData: reversedToData,
    hideLabels: true,
  });
}

export function runSqWithDummyPointsToShiftedOct() {
  const numShifts = -1;
  const origFromData = newSquareDataWithDummyPoints([3, 3], [6, 6]);
  const shiftedFromData = origFromData.map((d, i) => {
    return Object.assign({}, d, {
      position: floorMod(d.position - numShifts, origFromData.length),
    });
  });
  const origToData = newOctagonData([13, 1], [18, 6]);
  const shiftedToData = shiftData(origToData, numShifts).map(d => {
    return Object.assign({}, d, {
      labelText: (floorMod(d.position + numShifts, origToData.length) + 1).toString(),
      position: floorMod(d.position - numShifts, origToData.length),
    });
  });
  runShapeToShape({
    viewportOptions,
    fromData: shiftedFromData,
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
  const shiftedToData = shiftData(newOctagonData([13, 1], [18, 6]), numShifts);
  runShapeToShapeMorph({
    viewportOptions,
    fromData: shiftedFromData,
    toData: shiftedToData,
    hideLabels: true,
  });
}
