import * as d3 from 'lib/d3';

import { Options as ViewportOptions, create as createViewport } from 'scripts/viewport';
import {
  circleHandleInAttrs,
  circleHandleOutAttrs,
  circleSegmentAttrs,
  lineHandleInAttrs,
  lineHandleOutAttrs,
  pathAttrs,
  textLabelAttrs,
  toPathDataAttr,
} from './dom';

import { DataSelection } from 'scripts/types';
import { Datum } from './data';

export interface Options {
  readonly viewportOptions: ViewportOptions;
  readonly from: ShapeOptions;
  readonly to: ShapeOptions;
  readonly shouldMorph: boolean;
  readonly morphInPlace?: boolean;
}

export interface ShapeOptions {
  readonly data: Datum[];
  readonly hideLabels?: boolean;
  readonly hideHandles?: boolean;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly strokeDasharray?: number;
  readonly interpolateColor?: (index: number, len: number) => string;
}

export function runShapeToShape(options: Options) {
  const { viewportOptions: vpOpts, from, to } = options;

  const viewport = createViewport(vpOpts);
  const toContainer = viewport.append('g.to');
  if (!options.morphInPlace) {
    toContainer.append('path.shape').call(pathAttrs, to);
  }
  const fromContainer = viewport.append('g.from');
  fromContainer.append('path.shape').call(pathAttrs, from);

  // The initial display.
  update(fromContainer, options, from);
  if (!options.morphInPlace) {
    update(toContainer, options, to);
  }

  if (options.shouldMorph) {
    // Morph the shapes.
    update(fromContainer, options, to);
  }
}

function update(container: DataSelection, options: Options, shapeOptions: ShapeOptions) {
  const { viewportOptions: vpOpts } = options;
  const pixelRatio = vpOpts.size / Math.max(vpOpts.viewportWidth, vpOpts.viewportHeight);
  const { data } = shapeOptions;

  const t = d3.transition(undefined).duration(2000);

  container
    .select('path.shape')
    .datum(data)
    .transition(t)
    .call(toPathDataAttr);

  // JOIN new data with old elements.
  const keyFn = (d: Datum) => d.position.toString();
  const handleInLines = container.selectAll('line.handleIn').data(data, keyFn);
  const handleOutLines = container.selectAll('line.handleOut').data(data, keyFn);
  const handleInSegments = container.selectAll('circle.handleIn').data(data, keyFn);
  const handleOutSegments = container.selectAll('circle.handleOut').data(data, keyFn);
  const segments = container.selectAll('circle.segment').data(data, keyFn);
  const labels = container.selectAll('text.label').data(data, keyFn);

  // EXIT old elements not present in new data.
  if (!shapeOptions.hideHandles) {
    handleInLines.exit().remove();
    handleOutLines.exit().remove();
    handleInSegments.exit().remove();
    handleOutSegments.exit().remove();
  }
  segments.exit().remove();
  if (!shapeOptions.hideLabels) {
    labels.exit().remove();
  }

  // UPDATE old elements present in new data.
  if (!shapeOptions.hideHandles) {
    handleInLines.transition(t).call(lineHandleInAttrs, shapeOptions);
    handleOutLines.transition(t).call(lineHandleOutAttrs, shapeOptions);
    handleInSegments.transition(t).call(circleHandleInAttrs, shapeOptions);
    handleOutSegments.transition(t).call(circleHandleOutAttrs, shapeOptions);
  }
  segments.transition(t).call(circleSegmentAttrs, shapeOptions);
  if (!shapeOptions.hideLabels) {
    labels
      .transition(t)
      .text(d => d.labelText)
      .call(textLabelAttrs, pixelRatio);
  }

  // ENTER new elements present in new data.
  if (!shapeOptions.hideHandles) {
    handleInLines
      .enter()
      .append('line.handleIn')
      .call(lineHandleInAttrs, shapeOptions);
    handleOutLines
      .enter()
      .append('line.handleOut')
      .call(lineHandleOutAttrs, shapeOptions);
    handleInSegments
      .enter()
      .append('circle.handleIn')
      .call(circleHandleInAttrs, shapeOptions);
    handleOutSegments
      .enter()
      .append('circle.handleOut')
      .call(circleHandleOutAttrs, shapeOptions);
  }
  segments
    .enter()
    .append('circle.segment')
    .call(circleSegmentAttrs, shapeOptions);
  if (!shapeOptions.hideLabels) {
    labels
      .enter()
      .append('text.label')
      .text(d => d.labelText)
      .call(textLabelAttrs, pixelRatio);
  }
}
