// Importing with side-effects is necessary to ensure the add-ons are loaded properly.
import 'd3-jetpack';
import 'd3-selection-multi';

import { run as runAddPointsToAnimal } from './demos/needleman-wunsch/add-points-to-animals';
import { run as runFlubberStatesMultipleShapes } from './demos/flubber/states-multiple-shapes';
import { run as runFlubberStatesSingleShape } from './demos/flubber/states-single-shape';
import { run as runFlubberTexasToHawaii } from './demos/flubber/texas-to-hawaii';
import { run as runMorphSquareToOctagon } from './demos/intro-to-path-morphing/morph-sq-to-oct';
import { run as runMorphSquareToOctagonReversed } from './demos/intro-to-path-morphing/morph-sq-to-oct-reversed';
import { run as runMorphSquareToOctagonShifted } from './demos/intro-to-path-morphing/morph-sq-to-oct-shifted';
import { run as runMorphSquareToSquare } from './demos/intro-to-path-morphing/morph-sq-to-sq';
import { run as runShiftOctagonPoints } from './demos/intro-to-path-morphing/shift-octagon-points';

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
