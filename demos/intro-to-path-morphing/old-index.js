const TYPE_SQUARE_TO_SQUARE = 1;
const TYPE_SQUARE_TO_OCTAGON = 2;
const TYPE_SQUARE_TO_OCTAGON_REVERSED = 3;
const TYPE_SQUARE_TO_OCTAGON_SHIFTED = 4;
const TYPE_LINE_TO_CURVE = 5;
const TYPE_OCTAGON_TO_CIRCLE = 6;
const TYPE_ADD_POINTS_TO_SQUARE = 7;
const TYPE_ADD_HANDLES_TO_LINE = 8;
const TYPE_ADD_HANDLES_TO_OCTAGON = 9;

const ANIMATION_TYPE = TYPE_SQUARE_TO_OCTAGON_REVERSED;

(function() {
  const viewportWidth = 24;
  const viewportHeight = 12;
  const pixelRatio = 60;

  const dimensions = { width: viewportWidth * pixelRatio, height: viewportHeight * pixelRatio };
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const viewport = d3
    .select('body')
    .append('svg')
    .attr('width', dimensions.width + margin.left + margin.right)
    .attr('height', dimensions.height + margin.top + margin.bottom)
    .append('g.viewport')
    .attr('transform', `translate(${margin.left}, ${margin.top}) scale(${pixelRatio})`);

  viewport
    .append('rect.background')
    .datum([[0, 0], [viewportWidth, viewportHeight]])
    .call(ringToRectAttr);

  viewport
    .append('g')
    .selectAll('line.grid')
    .data([
      ..._.range(viewportWidth + 1).map(x => [[x, 0], [x, viewportHeight]]),
      ..._.range(viewportHeight + 1).map(y => [[0, y], [viewportWidth, y]]),
    ])
    .enter()
    .append('line.grid')
    .call(ringToLineAttr);

  viewport.append('path.filled-shape');
  viewport.append('path.stroked-shape');
  viewport.append('path.outlined-shape');

  switch (ANIMATION_TYPE) {
    case TYPE_SQUARE_TO_SQUARE:
      drawShape(transformSegments(newSquareSegments(), 6, 3, 3));
      drawOutlinedShape(transformSegments(newSquareSegments(), 10, 13, 1));
      break;
    case TYPE_SQUARE_TO_OCTAGON:
      drawShape(transformSegments(newSquareSegments(), 6, 3, 3));
      drawOutlinedShape(transformSegments(newOctagonSegments(), 10, 13, 1));
      break;
    case TYPE_SQUARE_TO_OCTAGON_REVERSED:
      drawShape(transformSegments(newSquareSegments(), 6, 3, 3));
      drawOutlinedShape(transformSegments(newOctagonSegments(), 10, 13, 1));
      break;
    case TYPE_SQUARE_TO_OCTAGON_SHIFTED:
      drawShape(transformSegments(newSquareSegments(), 6, 3, 3));
      drawOutlinedShape(transformSegments(newOctagonSegments(), 10, 13, 1));
      break;
    case TYPE_LINE_TO_CURVE:
      drawShape(transformSegments(newLineSegmentsWithHandles(), 6, 3, 3), 0, false, true);
      drawOutlinedShape(transformSegments(newCurveSegmentsWithHandles(), 10, 13, 1), 15);
      break;
    case TYPE_OCTAGON_TO_CIRCLE:
      drawShape(transformSegments(newOctagonSegmentsWithHandles(), 6, 3, 3));
      drawOutlinedShape(transformSegments(newCircleSegmentsWithHandles(), 10, 13, 1), 15);
      break;
    case TYPE_ADD_POINTS_TO_SQUARE:
      drawShape(transformSegments(newSquareSegments(), 6, 3, 3), 0, true);
      drawOutlinedShape(transformSegments(newOctagonSegments(), 10, 13, 1));
      break;
    case TYPE_ADD_HANDLES_TO_LINE:
      drawShape(transformSegments(newLineSegmentsWithHandles(), 6, 3, 3), 0, false, true, true);
      drawOutlinedShape(transformSegments(newCurveSegmentsWithHandles(), 10, 13, 1), 15);
      break;
    case TYPE_ADD_HANDLES_TO_OCTAGON:
      drawShape(transformSegments(newOctagonSegmentsWithHandles(), 6, 3, 3), 0, false, false, true);
      drawOutlinedShape(transformSegments(newCircleSegmentsWithHandles(), 10, 13, 1), 15);
      break;
    default:
      throw new Error('Invalid d type: ' + ANIMATION_TYPE);
  }

  d3
    .select('body')
    .append('div')
    .append('button')
    .text('Start')
    .attr('type', 'submit')
    .on('click', () => {
      switch (ANIMATION_TYPE) {
        case TYPE_SQUARE_TO_SQUARE:
          drawShape(transformSegments(newSquareSegments(), 10, 13, 1), 3000);
          break;
        case TYPE_SQUARE_TO_OCTAGON:
          drawShape(transformSegments(newOctagonSegments(), 10, 13, 1), 3000);
          break;
        case TYPE_SQUARE_TO_OCTAGON_REVERSED:
          drawShape(transformSegments(reverseSegments(newOctagonSegments()), 10, 13, 1), 3000);
          break;
        case TYPE_SQUARE_TO_OCTAGON_SHIFTED:
          drawShape(transformSegments(shiftSegments(newOctagonSegments(), 6), 10, 13, 1), 3000);
          break;
        case TYPE_LINE_TO_CURVE:
          drawShape(transformSegments(newCurveSegmentsWithHandles(), 10, 13, 1), 3000, false, true);
          break;
        case TYPE_OCTAGON_TO_CIRCLE:
          drawShape(transformSegments(newCircleSegmentsWithHandles(), 10, 13, 1), 3000);
          break;
        case TYPE_ADD_POINTS_TO_SQUARE:
          drawShape(transformSegments(newSquareSegments(), 6, 3, 3), 500, false, false);
          break;
        case TYPE_ADD_HANDLES_TO_LINE:
          drawShape(transformSegments(newLineSegmentsWithHandles(), 6, 3, 3), 500, false, true);
          break;
        case TYPE_ADD_HANDLES_TO_OCTAGON:
          drawShape(transformSegments(newOctagonSegmentsWithHandles(), 6, 3, 3), 500);
          break;
        default:
          throw new Error('Invalid animation type: ' + ANIMATION_TYPE);
      }
    });
})();

function drawShape(
  segments,
  transitionDuration = 0,
  shouldHideOddIndexedSegments = false,
  isStroked = false,
  shouldHideHandles = false,
) {
  const viewport = d3.select('g.viewport');
  const t = d3.transition().duration(transitionDuration);

  viewport
    .select(`path.${isStroked ? 'stroked' : 'filled'}-shape`)
    .datum(segments)
    .transition(t)
    .call(segmentsToPathDataAttr);

  const handleLines = viewport.selectAll('line.handle').data(
    segments.reduce((prev, [p, h1, h2], i) => {
      return [...prev, [h1, p, i], [p, h2, (i + 1) % segments.length]];
    }, []),
  );
  handleLines.exit().remove();
  handleLines
    .enter()
    .append('line.handle')
    .merge(handleLines)
    .attr('opacity', 0)
    .transition(t)
    .attr('opacity', shouldHideHandles ? 0 : 1)
    .call(ringToLineAttr)
    .attr('stroke', ([, , i]) => interpolateColor(i, segments.length));

  const handleCirclesData = segments;
  const handleCircles = viewport.selectAll('circle.handle').data(
    segments.reduce((prev, [, h1, h2], i) => {
      return [...prev, [h1, i], [h2, (i + 1) % segments.length]];
    }, []),
  );
  handleCircles.exit().remove();
  handleCircles
    .enter()
    .append('circle.handle')
    .merge(handleCircles)
    .attr('opacity', 0)
    .transition(t)
    .attr('opacity', shouldHideHandles ? 0 : 1)
    .attrs({
      cx: ([[x, y], i]) => x,
      cy: ([[x, y], i]) => y,
      r: 0.1,
    })
    .attr('fill', ([p, i]) => interpolateColor(i, segments.length));

  const segmentCircles = viewport.selectAll('circle.segment').data(segments.map(([p, , ,]) => p));
  segmentCircles.exit().remove();
  segmentCircles
    .enter()
    .append('circle.segment')
    .merge(segmentCircles)
    .transition(t)
    .attrs({
      cx: d => d[0],
      cy: d => d[1],
      r: (d, i) => (i % 2 !== 0 && shouldHideOddIndexedSegments ? 0 : 0.15),
    })
    .attr('fill', (_, i) => interpolateColor(i, segments.length));
}

function drawOutlinedShape(segments, strokeDashArray = 10) {
  const viewport = d3.select('g.viewport');
  viewport
    .select(`path.outlined-shape`)
    .datum(segments)
    .call(segmentsToPathDataAttr)
    .style('stroke-dasharray', strokeDashArray);
}

function interpolateColor(i, len) {
  return d3.interpolateCool((len <= 3 ? 1 : i) / len * 0.7 + 0.15);
}
