import { DataSelection } from './types';
import { Point } from './math';

export function ringToPathData(selection: DataSelection<Point[]>) {
  selection.attr('d', ring => 'M' + ring.join('L') + 'Z');
}
