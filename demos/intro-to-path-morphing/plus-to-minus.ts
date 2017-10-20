import { newMinusData, newPlusData, shiftData } from './util/data';

import { floorMod } from 'scripts/math';
import { runShapeToShape } from './util/shape-to-shape';

export function runPlusToMinusMorph() {
  runShapeToShape({
    viewportOptions: { size: 720, viewportWidth: 12, viewportHeight: 12 },
    from: {
      data: newPlusData(),
      fill: '#d8d8d8',
      stroke: '#000',
      hideLabels: true,
      hideHandles: true,
    },
    to: {
      data: newMinusData(),
      fill: 'none',
      stroke: 'none',
      hideLabels: true,
      hideHandles: true,
    },
    shouldMorph: true,
    morphInPlace: true,
  });
}

export function runPlusToSmallShiftMinusMorph() {
  const numShifts = -1;
  const origToData = newMinusData();
  const shiftedToData = shiftData(origToData, numShifts).map(d => {
    return Object.assign({}, d, {
      labelText: (floorMod(d.position + numShifts, origToData.length) + 1).toString(),
      position: floorMod(d.position + numShifts, origToData.length),
    });
  });
  runShapeToShape({
    viewportOptions: { size: 720, viewportWidth: 12, viewportHeight: 12 },
    from: {
      data: newPlusData(),
      fill: '#d8d8d8',
      stroke: '#000',
      hideLabels: true,
      hideHandles: true,
    },
    to: {
      data: shiftedToData,
      fill: 'none',
      stroke: 'none',
      hideLabels: true,
      hideHandles: true,
    },
    shouldMorph: true,
    morphInPlace: true,
  });
}

export function runPlusToLargeShiftMinusMorph() {
  const numShifts = 6;
  const origToData = newMinusData();
  const shiftedToData = shiftData(origToData, numShifts).map(d => {
    return Object.assign({}, d, {
      labelText: (floorMod(d.position + numShifts, origToData.length) + 1).toString(),
      position: floorMod(d.position + numShifts, origToData.length),
    });
  });
  runShapeToShape({
    viewportOptions: { size: 720, viewportWidth: 12, viewportHeight: 12 },
    from: {
      data: newPlusData(),
      fill: '#d8d8d8',
      stroke: '#000',
      hideLabels: true,
      hideHandles: true,
    },
    to: {
      data: shiftedToData,
      fill: 'none',
      stroke: 'none',
      hideLabels: true,
      hideHandles: true,
    },
    shouldMorph: true,
    morphInPlace: true,
  });
}
