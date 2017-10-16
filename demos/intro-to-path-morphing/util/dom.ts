import * as d3 from 'lib/d3';

import { DataSelection, DataTransition } from 'scripts/types';

import { Datum } from './data';

export function pathFilledAttrs(selection: DataSelection | DataTransition) {
  selection.attrs({
    fill: '#d8d8d8',
    stroke: '#d8d8d8',
    'stroke-width': 3,
    'vector-effect': 'non-scaling-stroke',
  });
}

export function pathOutlinedAttrs(selection: DataSelection | DataTransition, strokeDashArray = 10) {
  selection.attrs({
    fill: 'none',
    stroke: '#d8d8d8',
    'stroke-width': 3,
    'stroke-dasharray': strokeDashArray,
    'vector-effect': 'non-scaling-stroke',
  });
}

export function lineHandleInAttrs(selection: DataSelection<Datum> | DataTransition<Datum>) {
  lineHandleAttrs(selection, 'handleIn');
}

export function lineHandleOutAttrs(selection: DataSelection<Datum> | DataTransition<Datum>) {
  lineHandleAttrs(selection, 'handleOut');
}

function lineHandleAttrs(
  selection: DataSelection<Datum> | DataTransition<Datum>,
  type: 'handleIn' | 'handleOut',
) {
  const dataSelection: DataSelection<Datum> = isDataTransition(selection)
    ? selection.selection()
    : selection;
  const numSegments = dataSelection.data().length;
  selection.attrs({
    x1: d => (d[type] || d.segment)[0],
    y1: d => (d[type] || d.segment)[1],
    x2: d => d.segment[0],
    y2: d => d.segment[1],
    fill: 'none',
    stroke: (d, i) =>
      interpolateColor((i + (type === 'handleIn' ? 0 : 1)) % numSegments, numSegments),
    'stroke-width': 3,
    'vector-effect': 'non-scaling-stroke',
  });
}

export function circleHandleInAttrs(selection: DataSelection<Datum> | DataTransition<Datum>) {
  circleHandleAttrs(selection, 'handleIn');
}

export function circleHandleOutAttrs(selection: DataSelection<Datum> | DataTransition<Datum>) {
  circleHandleAttrs(selection, 'handleOut');
}

function circleHandleAttrs(
  selection: DataSelection<Datum> | DataTransition<Datum>,
  type: 'handleIn' | 'handleOut',
) {
  const dataSelection: DataSelection<Datum> = isDataTransition(selection)
    ? selection.selection()
    : selection;
  const numSegments = dataSelection.data().length;
  selection.attrs({
    cx: d => (d[type] || d.segment)[0],
    cy: d => (d[type] || d.segment)[1],
    r: () => 0.1,
    fill: (d, i) =>
      interpolateColor((i + (type === 'handleIn' ? 0 : 1)) % numSegments, numSegments),
    'stroke-width': 2,
    'vector-effect': 'non-scaling-stroke',
  });
}

export function circleSegmentAttrs(selection: DataSelection<Datum> | DataTransition<Datum>) {
  const dataSelection: DataSelection<Datum> = isDataTransition(selection)
    ? selection.selection()
    : selection;
  selection.attrs({
    cx: d => d.segment[0],
    cy: d => d.segment[1],
    r: () => 0.2,
    fill: (d, i) => interpolateColor(i, dataSelection.data().length),
    'stroke-width': 2,
    'vector-effect': 'non-scaling-stroke',
  });
}

export function textLabelAttrs(
  selection: DataSelection<Datum> | DataTransition<Datum>,
  pixelRatio = 1,
) {
  selection.attrs({
    x: d => d.label[0],
    y: d => d.label[1],
    fill: '#d8d8d8',
    'font-family': 'Roboto',
    'alignment-baseline': 'middle',
    'text-anchor': 'middle',
    'font-size': 36 / pixelRatio,
  });
}

export function toPathDataAttr(selection: DataSelection<Datum[]> | DataTransition<Datum[]>) {
  selection.attrs({
    d: data => {
      const cmds = data
        .map(({ segment: currSegment, handleOut: currH2 }, i) => {
          const next = data[(i + 1) % data.length];
          const { segment: nextSegment, handleIn: nextH1 } = next;
          return 'C ' + [currH2 || currSegment, nextH1 || nextSegment, nextSegment].join(' ');
        })
        .join(' ');
      return `M ${data[0].segment} ` + cmds + 'Z';
    },
  });
}

function isDataTransition<T>(s: DataSelection<T> | DataTransition<T>): s is DataTransition<T> {
  return 'selection' in s;
}

function interpolateColor(index: number, length: number) {
  index = (index + length) % length;
  return d3.interpolateCool(index / length * 0.7 + 0.15);
}
