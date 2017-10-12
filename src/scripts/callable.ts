import { DataSelection, Point } from './types';

export function ringToPathData(selection: DataSelection<Point[]>) {
  selection.attr('d', ring => 'M' + ring.join('L') + 'Z');
}
