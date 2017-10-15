// Importing with side-effects is necessary to ensure the add-ons are loaded properly.
import 'd3-jetpack';
import 'd3-selection-multi';

import {
  runAddPointsToAnimals,
  runNeedlemanWunschAnimalsSingleShape,
} from './demos/needleman-wunsch';
import {
  runFlubberAnimalsSingleShape,
  runFlubberStatesMultipleShapes,
  runFlubberStatesSingleShape,
  runFlubberTexasToHawaii,
} from './demos/flubber';
import {
  runMorphSquareToOctagonReversed,
  runMorphSquareToOctagonShifted,
  runOctToCircle,
  runShiftOctagonPoints,
  runSqToOct,
  runSqToSq,
  runSqToSqMorph,
  runSqWithDummiesToOct,
  runSqWithDummiesToOctMorph,
} from './demos/intro-to-path-morphing';

const demoMap = new Map<string, () => void>([
  ['/demos/intro-to-path-morphing/sq-to-sq.html', runSqToSq],
  ['/demos/intro-to-path-morphing/sq-to-sq-morph.html', runSqToSqMorph],
  ['/demos/intro-to-path-morphing/sq-to-oct.html', runSqToOct],
  ['/demos/intro-to-path-morphing/sq-with-dummies-to-oct.html', runSqWithDummiesToOct],
  ['/demos/intro-to-path-morphing/sq-with-dummies-to-oct-morph.html', runSqWithDummiesToOctMorph],
  ['/demos/intro-to-path-morphing/oct-to-circle.html', runOctToCircle],
  ['/demos/intro-to-path-morphing/shift-octagon-points.html', runShiftOctagonPoints],
  ['/demos/intro-to-path-morphing/morph-sq-to-oct-reversed.html', runMorphSquareToOctagonReversed],
  ['/demos/intro-to-path-morphing/morph-sq-to-oct-shifted.html', runMorphSquareToOctagonShifted],
  ['/demos/needleman-wunsch/animals-single-shape.html', runNeedlemanWunschAnimalsSingleShape],
  ['/demos/needleman-wunsch/add-points-to-animals.html', runAddPointsToAnimals],
  ['/demos/flubber/states-single-shape.html', runFlubberStatesSingleShape],
  ['/demos/flubber/states-multiple-shapes.html', runFlubberStatesMultipleShapes],
  ['/demos/flubber/texas-to-hawaii.html', runFlubberTexasToHawaii],
  ['/demos/flubber/animals-single-shape.html', runFlubberAnimalsSingleShape],
]);

const demoPath = window.location.pathname.slice(window.location.pathname.indexOf('/demos'));
if (demoMap.has(demoPath)) {
  demoMap.get(demoPath)();
}
