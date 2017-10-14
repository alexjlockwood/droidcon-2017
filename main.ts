// Importing with side-effects is necessary to ensure the add-ons are loaded properly.
import 'd3-jetpack';
import 'd3-selection-multi';

import { run as runDemo1 } from './demos/intro-to-path-morphing/demo1';
import { run as runDemo2 } from './demos/needleman-wunsch/demo2';
import { run as runFlubberStatesMultipleShapes } from './demos/flubber/states-multiple-shapes';
import { run as runFlubberStatesSingleShape } from './demos/flubber/states-single-shape';
import { run as runFlubberTexasToHawaii } from './demos/flubber/texas-to-hawaii';

const demoMap = new Map<string, () => void>([
  ['/demos/intro-to-path-morphing/demo1.html', runDemo1],
  ['/demos/needleman-wunsch/demo2.html', runDemo2],
  ['/demos/flubber/states-single-shape.html', runFlubberStatesSingleShape],
  ['/demos/flubber/states-multiple-shapes.html', runFlubberStatesMultipleShapes],
  ['/demos/flubber/texas-to-hawaii.html', runFlubberTexasToHawaii],
]);

console.log();

const demoPath = window.location.pathname.slice(window.location.pathname.indexOf('/demos'));
if (demoMap.has(demoPath)) {
  demoMap.get(demoPath)();
}
