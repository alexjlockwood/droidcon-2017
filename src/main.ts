// Importing with side-effects is necessary to ensure the add-ons are loaded properly.
import 'd3-jetpack';
import 'd3-selection-multi';

import {
  runFlubberStatesMultipleShapes,
  runFlubberStatesSingleShape,
  runFlubberTexasToHawaii,
} from './demos/flubber';
import {
  runMorphSquareToOctagon,
  runMorphSquareToOctagonReversed,
  runMorphSquareToOctagonShifted,
  runMorphSquareToSquare,
  runShiftOctagonPoints,
} from './demos/intro-to-path-morphing';

import { runAddPointsToAnimal } from './demos/needleman-wunsch';

const demoMap = new Map<string, () => void>([
  ['/demos/intro-to-path-morphing/shift-octagon-points.html', runShiftOctagonPoints],
  ['/demos/intro-to-path-morphing/morph-sq-to-sq.html', runMorphSquareToSquare],
  ['/demos/intro-to-path-morphing/morph-sq-to-oct.html', runMorphSquareToOctagon],
  ['/demos/intro-to-path-morphing/morph-sq-to-oct-reversed.html', runMorphSquareToOctagonReversed],
  ['/demos/intro-to-path-morphing/morph-sq-to-oct-shifted.html', runMorphSquareToOctagonShifted],
  ['/demos/needleman-wunsch/add-points-to-animal.html', runAddPointsToAnimal],
  ['/demos/flubber/states-single-shape.html', runFlubberStatesSingleShape],
  ['/demos/flubber/states-multiple-shapes.html', runFlubberStatesMultipleShapes],
  ['/demos/flubber/texas-to-hawaii.html', runFlubberTexasToHawaii],
]);

const demoPath = window.location.pathname.slice(window.location.pathname.indexOf('/demos'));
if (demoMap.has(demoPath)) {
  demoMap.get(demoPath)();
}
