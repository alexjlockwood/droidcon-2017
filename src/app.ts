import * as d3 from 'd3';

import { redditObject } from './redditFormat';

const width = 960;
const height = 480;

const svg = d3
  .select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const plotMargins = {
  top: 30,
  bottom: 30,
  left: 150,
  right: 30,
};
const plotGroup = svg
  .append('g')
  .classed('plot', true)
  .attr('transform', `translate(${plotMargins.left},${plotMargins.top})`);

const plotWidth = width - plotMargins.left - plotMargins.right;
const plotHeight = height - plotMargins.top - plotMargins.bottom;

const xScale = d3.scaleTime().range([0, plotWidth]);
const xAxis = d3.axisBottom(xScale);
const xAxisGroup = plotGroup
  .append('g')
  .classed('x', true)
  .classed('axis', true)
  .attr('transform', `translate(${0},${plotHeight})`)
  .call(xAxis);

const yScale = d3.scaleLinear().range([plotHeight, 0]);
const yAxis = d3.axisLeft(yScale);
const yAxisGroup = plotGroup
  .append('g')
  .classed('y', true)
  .classed('axis', true)
  .call(yAxis);

const pointsGroup = plotGroup.append('g').classed('points', true);

d3.json<redditObject>('https://api.reddit.com', (error, data) => {
  if (error) {
    console.error(error);
  } else {
    const prepared = data.data.children.map(d => {
      return {
        date: new Date(d.data.created * 1000),
        score: d.data.score,
      };
    });
    xScale.domain(d3.extent(prepared, d => d.date)).nice();
    xAxisGroup.call(xAxis);

    yScale.domain(d3.extent(prepared, d => d.score)).nice();
    yAxisGroup.call(yAxis);

    const dataBound = pointsGroup.selectAll('.post').data(prepared);

    // delete extra points
    dataBound.exit().remove();

    // add new points
    const enterSelection = dataBound
      .enter()
      .append('g')
      .classed('post', true);

    enterSelection
      .append('circle')
      .attr('r', 2)
      .style('fill', 'red');

    // update all existing points
    enterSelection
      .merge(dataBound)
      .attr('transform', (d, i) => `translate(${xScale(d.date)},${yScale(d.score)})`);
  }
});
