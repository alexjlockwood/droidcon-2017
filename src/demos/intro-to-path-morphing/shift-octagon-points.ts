// import * as Viewport from 'scripts/viewport';
// import * as d3 from 'lib/d3';

// import { Datum, newOctagonData, newSquareData } from './util/data';

// import { DataSelection } from 'scripts/types';
// import { Point } from 'scripts/math';

// const options = { size: 1440, viewportWidth: 24, viewportHeight: 12 };
// const pixelRatio = options.size / Math.max(options.viewportWidth, options.viewportHeight);

// export function run() {
//   const viewport = Viewport.create(options);

//   const squareData = newSquareData([3, 3], [6, 6]);
//   const octagonData = newOctagonData([13, 1], [18, 6]);

//   const fromContainer = viewport.append('g.from');
//   const toContainer = viewport.append('g.to');

//   fromContainer
//     .append('path.from')
//     .datum(squareData)
//     .attrs({ d: d => 'M' + d.map(({ segment }) => segment).join('L') + 'Z' });

//   toContainer
//     .append('path.to')
//     .datum(octagonData)
//     .attrs({ d: d => 'M' + d.map(({ segment }) => segment).join('L') + 'Z' });

//   // The initial display.
//   update(fromContainer, squareData);
//   update(toContainer, octagonData);

//   let shiftOffset = 0;
//   d3.timeout(function recurseFn() {
//     shiftOffset = (shiftOffset + 1) % octagonData.length;
//     const data = octagonData.map((d, i) => {
//       const { segment, label } = octagonData[(i + shiftOffset) % octagonData.length];
//       return {
//         segment,
//         label,
//         position: d.position,
//       };
//     });
//     update(fromContainer, squareData);
//     update(toContainer, data);
//     if (shiftOffset !== 0) {
//       d3.timeout(recurseFn, 1000);
//     }
//   }, 1000);
// }

// function update(container: DataSelection, data: Datum[]) {
//   const t = d3.transition(undefined).duration(500);

//   // JOIN new data with old elements.
//   const keyFn = (d: Datum) => d.position.toString();
//   const segments = container.selectAll('circle.segment').data(data, keyFn);
//   const labels = container.selectAll('text.label').data(data, keyFn);

//   // EXIT old elements not present in new data.
//   segments.exit().remove();
//   labels.exit().remove();

//   // UPDATE old elements present in new data.
//   segments.transition(t).attrs({
//     cx: d => d.segment[0],
//     cy: d => d.segment[1],
//     fill: (d, i) => d3.interpolateCool(i / data.length * 0.7 + 0.15),
//   });
//   labels.transition(t).attrs({ x: d => d.label[0], y: d => d.label[1] });

//   // ENTER new elements present in new data.
//   segments
//     .enter()
//     .append('circle.segment')
//     .attrs({
//       cx: d => d.segment[0],
//       cy: d => d.segment[1],
//       r: () => 0.2,
//       fill: (d, i) => d3.interpolateCool(i / data.length * 0.7 + 0.15),
//     });
//   labels
//     .enter()
//     .append('text.label')
//     .text(d => d.position + 1)
//     .attrs({
//       x: d => d.label[0],
//       y: d => d.label[1],
//       'font-family': 'Roboto',
//       'alignment-baseline': 'middle',
//       'text-anchor': 'middle',
//       'font-size': 36 / pixelRatio,
//     });
// }

// function getLabelOffsetX(i: number) {
//   return i === 1 || i === 3 ? 0.4 : i === 2 ? 0.6 : i === 5 || i === 7 ? -0.4 : i === 6 ? -0.6 : 0;
// }

// function getLabelOffsetY(i: number) {
//   return i === 1 || i === 7 ? -0.4 : i === 0 ? -0.5 : i === 3 || i === 5 ? 0.4 : i === 4 ? 0.6 : 0;
// }
