// Importing with side-effects is necessary to ensure the add-ons are loaded properly.
import 'd3-jetpack';
import 'd3-selection-multi';

import {
  runAddPointsToAnimals,
  runNeedlemanWunschAnimalsSingleShape,
} from './demos/needleman-wunsch';
import {
  runCurveToCurve,
  runCurveWithHandlesToCurveWithHandles,
  runCurveWithHandlesToCurveWithHandlesMorph,
  runLineToCurve,
  runLineWithHandlesToCurve,
  runLineWithHandlesToCurveMorph,
  runOctToCircle,
  runOctToCircleWithDummyPoints,
  runOctWithHandlesToCircleWithDummyPoints,
  runOctWithHandlesToCircleWithDummyPointsMorph,
  runSqToOct,
  runSqToOctMorph,
  runSqToSq,
  runSqToSqMorph,
  runSqWithDummyPointsToOct,
  runSqWithDummyPointsToOctMorph,
  runSqWithDummyPointsToReversedOct,
  runSqWithDummyPointsToReversedOctMorph,
  runSqWithDummyPointsToShiftedOct,
  runSqWithDummyPointsToShiftedOctMorph,
} from './demos/intro-to-path-morphing';
import {
  runFlubberAnimalsSingleShape,
  runFlubberStatesMultipleShapes,
  runFlubberStatesSingleShape,
  runFlubberTexasToHawaii,
} from './demos/flubber';

const introToPathMorphingMap = new Map<string, () => void>([
  ['?sq-to-sq', runSqToSq],
  ['?sq-to-sq-morph', runSqToSqMorph],
  ['?sq-to-oct', runSqToOct],
  ['?sq-to-oct-morph', runSqToOctMorph],
  ['?sq-with-dummy-points-to-oct', runSqWithDummyPointsToOct],
  ['?sq-with-dummy-points-to-oct-morph', runSqWithDummyPointsToOctMorph],
  ['?sq-with-dummy-points-to-reversed-oct', runSqWithDummyPointsToReversedOct],
  ['?sq-with-dummy-points-to-reversed-oct-morph', runSqWithDummyPointsToReversedOctMorph],
  ['?sq-with-dummy-points-to-shifted-oct', runSqWithDummyPointsToShiftedOct],
  ['?sq-with-dummy-points-to-shifted-oct-morph', runSqWithDummyPointsToShiftedOctMorph],
  ['?line-to-curve', runLineToCurve],
  ['?line-with-handles-to-curve', runLineWithHandlesToCurve],
  ['?line-with-handles-to-curve-morph', runLineWithHandlesToCurveMorph],
  ['?curve-to-curve', runCurveToCurve],
  ['?curve-with-handles-to-curve-with-handles', runCurveWithHandlesToCurveWithHandles],
  ['?curve-with-handles-to-curve-with-handles-morph', runCurveWithHandlesToCurveWithHandlesMorph],
  ['?oct-to-circle', runOctToCircle],
  ['?oct-to-circle-with-dummy-points', runOctToCircleWithDummyPoints],
  ['?oct-with-handles-to-circle-with-dummy-points', runOctWithHandlesToCircleWithDummyPoints],
  [
    '?oct-with-handles-to-circle-with-dummy-points-morph',
    runOctWithHandlesToCircleWithDummyPointsMorph,
  ],
]);

const flubberMap = new Map<string, () => void>([
  ['?states-single-shape', runFlubberStatesSingleShape],
  ['?states-multiple-shapes', runFlubberStatesMultipleShapes],
  ['?texas-to-hawaii', runFlubberTexasToHawaii],
  ['?animals-single-shape', runFlubberAnimalsSingleShape],
]);

const needlemanWunschMap = new Map<string, () => void>([
  ['?animals-single-shape', runNeedlemanWunschAnimalsSingleShape],
  ['?add-points-to-animals', runAddPointsToAnimals],
]);

const sectionMap = new Map<string, Map<string, () => void>>([
  ['/demos/intro-to-path-morphing/index.html', introToPathMorphingMap],
  ['/demos/flubber/index.html', flubberMap],
  ['/demos/needleman-wunsch/index.html', needlemanWunschMap],
]);

const sectionPath = window.location.pathname.slice(window.location.pathname.indexOf('/demos'));
if (sectionMap.has(sectionPath)) {
  const demoMap = sectionMap.get(sectionPath);
  if (demoMap.has(window.location.search)) {
    demoMap.get(window.location.search)();
  }
}
