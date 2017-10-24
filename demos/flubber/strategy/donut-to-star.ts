import { DataSelection } from 'scripts/types';
import { create as createViewport } from 'scripts/viewport';

export function run() {
  const viewport = createViewport({
    size: 1440,
    viewportWidth: 24,
    viewportHeight: 12,
  });
  const toPath = viewport.append('path').call(setPathAttrs);
  const fromPath = viewport.append('path').call(setPathAttrs);
  const fromPathData = `
    M 6 3 C 7.656 3 9 4.344 9 6 C 9 7.656 7.656 9 6 9 C 4.344 9 3 7.656 3 6 C 3 4.344 4.344 3 6 3 Z
    M 6 5 C 6.552 5 7 5.448 7 6 C 7 6.552 6.552 7 6 7 C 5.448 7 5 6.552 5 6 C 5 5.448 5.448 5 6 5 Z
  `;
  const toPathData = `
    M 18 3 L 18.882 4.788 L 20.856 5.07 L 19.428 6.462 L 19.764 8.43 L 18 7.5 L 16.236 8.43 L 16.572 6.462 L 15.144 5.07 L 17.118 4.788 Z
  `;
  fromPath.attrs({ d: fromPathData });
  toPath.attrs({ d: toPathData });
}
function setPathAttrs(selection: DataSelection) {
  selection.attrs({
    fill: '#d8d8d8',
    stroke: '#000',
    'stroke-width': 2,
    'vector-effect': 'non-scaling-stroke',
    'fill-rule': 'evenodd',
  });
}
