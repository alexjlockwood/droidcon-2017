import * as d3 from 'lib/d3';

import { Datum, newOctagonData, newSquareData } from './data';
import { Options as ViewportOptions, create as createViewport } from 'scripts/viewport';
import {
  circleHandleInAttrs,
  circleHandleOutAttrs,
  circleSegmentAttrs,
  lineHandleInAttrs,
  lineHandleOutAttrs,
  pathFilledAttrs,
  pathOutlinedAttrs,
  textLabelAttrs,
  toPathDataAttr,
} from './dom';

import { DataSelection } from 'scripts/types';
import { Point } from 'scripts/math';

export interface Options {
  readonly viewportOptions: ViewportOptions;
  readonly fromData: Datum[];
  readonly toData: Datum[];
  readonly hideLabels?: boolean;
  readonly hideHandles?: boolean;
  readonly strokeDashArray?: number;
}

export function runShapeToShape(options: Options) {
  const { viewportOptions: vpOpts, fromData, toData, strokeDashArray } = options;

  const viewport = createViewport(vpOpts);
  const fromContainer = viewport.append('g.from');
  const fromPath = fromContainer.append('path.shape');
  fromPath.datum(fromData).call(pathOutlinedAttrs, strokeDashArray);

  const toContainer = viewport.append('g.to');
  const toPath = toContainer.append('path.shape');
  toPath.datum(toData).call(pathOutlinedAttrs, strokeDashArray);

  // The initial display.
  update(options, fromContainer, fromData);
  update(options, toContainer, toData);
}

export function runShapeToShapeMorph(options: Options) {
  const { viewportOptions: vpOpts, fromData, toData, strokeDashArray } = options;

  const viewport = createViewport(vpOpts);
  const toContainer = viewport.append('g.to');
  const toPath = toContainer.append('path.shape').call(pathOutlinedAttrs, strokeDashArray);
  const fromContainer = viewport.append('g.from');
  const fromPath = fromContainer.append('path.shape').call(pathFilledAttrs, strokeDashArray);

  // The initial display.
  update(options, fromContainer, fromData);
  update(options, toContainer, toData);

  // Morph the shapes.
  update(options, fromContainer, toData);
}

function update(options: Options, container: DataSelection, data: Datum[]) {
  const { viewportOptions: vpOpts } = options;
  const pixelRatio = vpOpts.size / Math.max(vpOpts.viewportWidth, vpOpts.viewportHeight);

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
  if (!options.hideHandles) {
    handleInLines.exit().remove();
    handleOutLines.exit().remove();
    handleInSegments.exit().remove();
    handleOutSegments.exit().remove();
  }
  segments.exit().remove();
  if (!options.hideLabels) {
    labels.exit().remove();
  }

  // UPDATE old elements present in new data.
  if (!options.hideHandles) {
    handleInLines.transition(t).call(lineHandleInAttrs);
    handleOutLines.transition(t).call(lineHandleOutAttrs);
    handleInSegments.transition(t).call(circleHandleInAttrs);
    handleOutSegments.transition(t).call(circleHandleOutAttrs);
  }
  segments.transition(t).call(circleSegmentAttrs);
  if (!options.hideLabels) {
    labels
      .transition(t)
      .text(d => d.labelText)
      .call(textLabelAttrs, pixelRatio);
  }

  // ENTER new elements present in new data.
  if (!options.hideHandles) {
    handleInLines
      .enter()
      .append('line.handleIn')
      .call(lineHandleInAttrs);
    handleOutLines
      .enter()
      .append('line.handleOut')
      .call(lineHandleOutAttrs);
    handleInSegments
      .enter()
      .append('circle.handleIn')
      .call(circleHandleInAttrs);
    handleOutSegments
      .enter()
      .append('circle.handleOut')
      .call(circleHandleOutAttrs);
  }
  segments
    .enter()
    .append('circle.segment')
    .call(circleSegmentAttrs);
  if (!options.hideLabels) {
    labels
      .enter()
      .append('text.label')
      .text(d => d.labelText)
      .call(textLabelAttrs, pixelRatio);
  }
}
