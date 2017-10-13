// Importing with side-effects is necessary to ensure the add-ons are loaded properly.
import 'd3-jetpack';
import 'd3-selection-multi';

import { run as runDemo1 } from './demos/demo1';
import { run as runDemo2 } from './demos/demo2';
import { run as runDemo3 } from './demos/demo3';

if (window.location.href.includes('demo1')) {
  runDemo1();
} else if (window.location.href.includes('demo2')) {
  runDemo2();
} else if (window.location.href.includes('demo3')) {
  runDemo3();
}
