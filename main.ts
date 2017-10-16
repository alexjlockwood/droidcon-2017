// Importing with side-effects is necessary to ensure the add-ons are loaded properly.
import 'd3-jetpack';
import 'd3-selection-multi';

import {
  runAddPointsToAnimals,
  runNeedlemanWunschAnimalsSingleShape,
} from './demos/needleman-wunsch';
import {
  runCurveToCurve,
  runCurveToCurveMorph,
  runLineToCurve,
  runMorphSquareToOctagonReversed,
  runMorphSquareToOctagonShifted,
  runOctToCircle,
  runOctToCircleWithDummyPoints,
  runOctWithHandlesToCircleWithDummyPoints,
  runOctWithHandlesToCircleWithDummyPointsMorph,
  runShiftOctagonPoints,
  runSqToOct,
  runSqToSq,
  runSqToSqMorph,
  runSqWithDummiesToOct,
  runSqWithDummiesToOctMorph,
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
  ['?sq-with-dummies-to-oct', runSqWithDummiesToOct],
  ['?sq-with-dummies-to-oct-morph', runSqWithDummiesToOctMorph],
  ['?line-to-curve', runLineToCurve],
  ['?curve-to-curve', runCurveToCurve],
  ['?curve-to-curve-morph', runCurveToCurveMorph],
  ['?oct-to-circle', runOctToCircle],
  ['?oct-to-circle-with-dummies', runOctToCircleWithDummyPoints],
  ['?oct-with-handles-to-circle-with-dummies', runOctWithHandlesToCircleWithDummyPoints],
  ['?oct-with-handles-to-circle-with-dummies-morph', runOctWithHandlesToCircleWithDummyPointsMorph],
  ['?shift-octagon-points', runShiftOctagonPoints],
  ['?morph-sq-to-oct-reversed', runMorphSquareToOctagonReversed],
  ['?morph-sq-to-oct-shifted', runMorphSquareToOctagonShifted],
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
