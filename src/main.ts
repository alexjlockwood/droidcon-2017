// Importing with side-effects is necessary to ensure the add-ons are loaded properly.
import 'd3-jetpack';
import 'd3-selection-multi';

import { run as runDemo1 } from './demos/demo1';
import { run as runDemo2 } from './demos/demo2';
import { run as runDemo3 } from './demos/demo3';
import { run as runMultipleTriangulationDemo } from './demos/triangulation/multiple';
import { run as runSingleTriangulationDemo } from './demos/triangulation/single';

const demoMap = new Map<string, () => void>([
  ['/demos/demo1.html', runDemo1],
  ['/demos/demo2.html', runDemo2],
  ['/demos/demo3.html', runDemo3],
  ['/demos/triangulation/single.html', runSingleTriangulationDemo],
  ['/demos/triangulation/multiple.html', runMultipleTriangulationDemo],
]);

if (demoMap.has(window.location.pathname)) {
  demoMap.get(window.location.pathname)();
}
