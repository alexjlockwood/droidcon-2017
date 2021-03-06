// Importing with side-effects is necessary to ensure the add-ons are loaded properly.
import 'd3-jetpack';
import 'd3-selection-multi';

import {
  runAnimalsTriangulate,
  runTexasToHawaiiFade,
  runTexasToHawaiiTriangulate,
} from './demos/flubber/multi-shape';
import {
  runCircleToStarAddDummyPoints,
  runCircleToStarMorph,
  runCircleToStarPickStartingPoint,
  runDonutToStar,
  runDonutToStarMorph,
} from './demos/flubber/strategy';
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
  runPlusToLargeShiftMinusMorph,
  runPlusToMinusMorph,
  runPlusToSmallShiftMinusMorph,
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

import { runFlubberSingleShapeAnimalsMorph } from './demos/flubber/single-shape';
import { runNeedlemanWunschSingleShapeAnimalsMorph } from './demos/needleman-wunsch';

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
  ['?plus-to-minus-morph', runPlusToMinusMorph],
  ['?plus-to-small-shift-minus-morph', runPlusToSmallShiftMinusMorph],
  ['?plus-to-large-shift-minus-morph', runPlusToLargeShiftMinusMorph],
]);

const flubberStrategyMap = new Map<string, () => void>([
  ['?circle-to-star-add-dummy-points', runCircleToStarAddDummyPoints],
  ['?circle-to-star-pick-starting-point', runCircleToStarPickStartingPoint],
  ['?circle-to-star-morph', runCircleToStarMorph],
  ['?donut-to-star', runDonutToStar],
  ['?donut-to-star-morph', runDonutToStarMorph],
]);

const flubberSingleShapeMap = new Map<string, () => void>([
  ['?single-shape-animals-morph', runFlubberSingleShapeAnimalsMorph],
]);

const flubberMultiShapeMap = new Map<string, () => void>([
  ['?texas-to-hawaii-fade', runTexasToHawaiiFade],
  ['?texas-to-hawaii-triangulate', runTexasToHawaiiTriangulate],
  ['?animals-triangulate', runAnimalsTriangulate],
]);

const needlemanWunschMap = new Map<string, () => void>([
  ['?single-shape-animals-morph', runNeedlemanWunschSingleShapeAnimalsMorph],
]);

const sectionMap = new Map<string, Map<string, () => void>>([
  ['/demos/intro-to-path-morphing/index.html', introToPathMorphingMap],
  ['/demos/flubber/strategy/index.html', flubberStrategyMap],
  ['/demos/flubber/multi-shape/index.html', flubberMultiShapeMap],
  ['/demos/flubber/single-shape/index.html', flubberSingleShapeMap],
  ['/demos/needleman-wunsch/index.html', needlemanWunschMap],
]);

const sectionPath = window.location.pathname.slice(window.location.pathname.indexOf('/demos'));
if (sectionMap.has(sectionPath)) {
  const demoMap = sectionMap.get(sectionPath);
  if (demoMap.has(window.location.search)) {
    demoMap.get(window.location.search)();
  }
}
