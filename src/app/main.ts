// Importing with side-effects is necessary to ensure the add-on is loaded properly.
import 'd3-selection-multi';

import { run as runDemo1 } from './demos/demo1';

if (window.location.href.indexOf('demo1') >= 0) {
  runDemo1();
}
