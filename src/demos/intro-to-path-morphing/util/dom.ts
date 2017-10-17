import * as d3 from 'lib/d3';

import { DataSelection, DataTransition } from 'scripts/types';

import { Datum } from './data';

export interface PathAttrs {
  readonly fill: string;
  readonly stroke: string;
  readonly strokeWidth: number;
  readonly strokeDasharray: number;
}

export function pathAttrs(
  selection: DataSelection | DataTransition,
  attrs: Partial<PathAttrs> = {},
) {
  const fill = 'fill' in attrs ? attrs.fill : 'none';
  const stroke = 'stroke' in attrs ? attrs.stroke : 'none';
  const strokeWidth = 'strokeWidth' in attrs ? attrs.strokeWidth : 3;
  const strokeDasharray = 'strokeDasharray' in attrs ? attrs.strokeDasharray : 0;
  selection.attrs({
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-dasharray': strokeDasharray,
    'vector-effect': 'non-scaling-stroke',
  });
}

export interface ColorAttrs {
  interpolateColor?: (index: number, length: number) => string;
}

export function lineHandleInAttrs(
  selection: DataSelection<Datum> | DataTransition<Datum>,
  colorAttrs: ColorAttrs,
) {
  lineHandleAttrs(selection, colorAttrs, 'handleIn');
}

export function lineHandleOutAttrs(
  selection: DataSelection<Datum> | DataTransition<Datum>,
  colorAttrs: ColorAttrs,
) {
  lineHandleAttrs(selection, colorAttrs, 'handleOut');
}

function lineHandleAttrs(
  selection: DataSelection<Datum> | DataTransition<Datum>,
  colorAttrs: ColorAttrs,
  type: 'handleIn' | 'handleOut',
) {
  const interpolateColorFn =
    'interpolateColor' in colorAttrs ? colorAttrs.interpolateColor : interpolateColor;
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
      interpolateColorFn((i + (type === 'handleIn' ? 0 : 1)) % numSegments, numSegments),
    'stroke-width': 3,
    'vector-effect': 'non-scaling-stroke',
  });
}

export function circleHandleInAttrs(
  selection: DataSelection<Datum> | DataTransition<Datum>,
  colorAttrs: ColorAttrs,
) {
  circleHandleAttrs(selection, colorAttrs, 'handleIn');
}

export function circleHandleOutAttrs(
  selection: DataSelection<Datum> | DataTransition<Datum>,
  colorAttrs: ColorAttrs,
) {
  circleHandleAttrs(selection, colorAttrs, 'handleOut');
}

function circleHandleAttrs(
  selection: DataSelection<Datum> | DataTransition<Datum>,
  colorAttrs: ColorAttrs,
  type: 'handleIn' | 'handleOut',
) {
  const interpolateColorFn =
    'interpolateColor' in colorAttrs ? colorAttrs.interpolateColor : interpolateColor;
  const dataSelection: DataSelection<Datum> = isDataTransition(selection)
    ? selection.selection()
    : selection;
  const numSegments = dataSelection.data().length;
  selection.attrs({
    cx: d => (d[type] || d.segment)[0],
    cy: d => (d[type] || d.segment)[1],
    r: () => 0.1,
    fill: (d, i) =>
      interpolateColorFn((i + (type === 'handleIn' ? 0 : 1)) % numSegments, numSegments),
  });
}

export function circleSegmentAttrs(
  selection: DataSelection<Datum> | DataTransition<Datum>,
  colorAttrs: ColorAttrs,
) {
  const interpolateColorFn =
    'interpolateColor' in colorAttrs ? colorAttrs.interpolateColor : interpolateColor;
  const dataSelection: DataSelection<Datum> = isDataTransition(selection)
    ? selection.selection()
    : selection;
  selection.attrs({
    cx: d => d.segment[0],
    cy: d => d.segment[1],
    r: () => 0.225,
    fill: (d, i) => interpolateColorFn(i, dataSelection.data().length),
    stroke: '#000',
    'stroke-width': 2.25,
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
      if (data.every(d => !d.handleIn && !d.handleOut)) {
        return `M ${data[0].segment} ` + data.map(d => d.segment) + 'Z';
      }
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
