import * as d3 from 'lib/d3';

import { ShapeOptions, runShapeToShape } from './util/shape-to-shape';
import {
  newOctagonData,
  newSquareData,
  newSquareDataWithDummyPoints,
  reverseData,
  shiftData,
} from './util/data';

import { floorMod } from 'scripts/math';

const viewportOptions = { size: 1440, viewportWidth: 24, viewportHeight: 12 };

export function runSqToOct() {
  sqToOct(false);
}

export function runSqToOctMorph() {
  sqToOct(true);
}

function sqToOct(shouldMorph: boolean) {
  runShapeToShape({
    viewportOptions,
    from: {
      data: newSquareData([3, 3], [6, 6]),
      hideLabels: shouldMorph,
      fill: shouldMorph ? '#d8d8d8' : 'none',
      stroke: shouldMorph ? '#000' : '#d8d8d8',
      strokeDasharray: shouldMorph ? 0 : 10,
      interpolateColor: i => {
        return d3.interpolateCool(i / 8 * 0.7 + 0.15);
      },
    },
    to: {
      data: newOctagonData([13, 1], [18, 6]),
      hideLabels: shouldMorph,
      fill: 'none',
      stroke: '#d8d8d8',
      strokeDasharray: 10,
      interpolateColor: i => {
        if (i >= 4) {
          return '#F44336';
        }
        return d3.interpolateCool(i / 8 * 0.7 + 0.15);
      },
    },
    shouldMorph,
  });
}

export function runSqWithDummyPointsToOct() {
  sqWithDummyPointsToOct(false);
}

export function runSqWithDummyPointsToOctMorph() {
  sqWithDummyPointsToOct(true);
}

function sqWithDummyPointsToOct(shouldMorph: boolean) {
  runShapeToShape({
    viewportOptions,
    from: {
      data: newSquareDataWithDummyPoints([3, 3], [6, 6]),
      hideLabels: shouldMorph,
      fill: shouldMorph ? '#d8d8d8' : 'none',
      stroke: shouldMorph ? '#000' : '#d8d8d8',
      strokeDasharray: shouldMorph ? 0 : 10,
    },
    to: {
      data: newOctagonData([13, 1], [18, 6]),
      hideLabels: shouldMorph,
      fill: 'none',
      stroke: '#d8d8d8',
      strokeDasharray: 10,
    },
    shouldMorph,
  });
}

export function runSqWithDummyPointsToReversedOct() {
  const shouldMorph = false;
  runShapeToShape({
    viewportOptions,
    from: {
      data: newSquareDataWithDummyPoints([3, 3], [6, 6]),
      fill: shouldMorph ? '#d8d8d8' : 'none',
      stroke: '#d8d8d8',
      strokeDasharray: shouldMorph ? 0 : 10,
    },
    to: {
      data: reverseData(newOctagonData([13, 1], [18, 6])).map((d, i) => {
        return Object.assign({}, d, { labelText: (i + 1).toString() });
      }),
      fill: 'none',
      stroke: '#d8d8d8',
      strokeDasharray: 10,
    },
    shouldMorph: false,
  });
}

export function runSqWithDummyPointsToReversedOctMorph() {
  const shouldMorph = true;
  const origFromData = newSquareDataWithDummyPoints([3, 3], [6, 6]);
  const reversedFromData = origFromData.map((d, i) => {
    const position = d.position === 0 ? 0 : origFromData.length - 1 - (i - 1);
    return Object.assign({}, d, { position });
  });
  const reversedToData = reverseData(newOctagonData([13, 1], [18, 6])).map((d, i) => {
    const position = d.position;
    return Object.assign({}, d, { position, labelText: (position + 1).toString() });
  });
  runShapeToShape({
    viewportOptions,
    from: {
      data: reversedFromData,
      hideLabels: true,
      fill: shouldMorph ? '#d8d8d8' : 'none',
      stroke: '#d8d8d8',
      strokeDasharray: shouldMorph ? 0 : 10,
    },
    to: {
      data: reversedToData,
      hideLabels: true,
      fill: 'none',
      stroke: '#d8d8d8',
      strokeDasharray: 10,
    },
    shouldMorph: true,
  });
}

export function runSqWithDummyPointsToShiftedOct() {
  const numShifts = -1;
  const shouldMorph = false;
  const origToData = newOctagonData([13, 1], [18, 6]);
  const shiftedToData = shiftData(origToData, numShifts).map(d => {
    return Object.assign({}, d, {
      labelText: (floorMod(d.position + numShifts, origToData.length) + 1).toString(),
    });
  });
  runShapeToShape({
    viewportOptions,
    from: {
      data: newSquareDataWithDummyPoints([3, 3], [6, 6]),
      fill: shouldMorph ? '#d8d8d8' : 'none',
      stroke: '#d8d8d8',
      strokeDasharray: shouldMorph ? 0 : 10,
    },
    to: {
      data: shiftedToData,
      fill: 'none',
      stroke: '#d8d8d8',
      strokeDasharray: 10,
    },
    shouldMorph: false,
  });
}

export function runSqWithDummyPointsToShiftedOctMorph() {
  const shouldMorph = true;
  const numShifts = -1;
  const origFromData = newSquareDataWithDummyPoints([3, 3], [6, 6]);
  const shiftedFromData = origFromData.map((d, i) => {
    return Object.assign({}, d, {
      position: floorMod(d.position - numShifts, origFromData.length),
    });
  });
  runShapeToShape({
    viewportOptions,
    from: {
      data: shiftedFromData,
      hideLabels: true,
      fill: shouldMorph ? '#d8d8d8' : 'none',
      stroke: '#d8d8d8',
      strokeDasharray: shouldMorph ? 0 : 10,
    },
    to: {
      data: shiftData(newOctagonData([13, 1], [18, 6]), numShifts),
      hideLabels: true,
      fill: 'none',
      stroke: '#d8d8d8',
      strokeDasharray: 10,
    },
    shouldMorph: true,
  });
}
