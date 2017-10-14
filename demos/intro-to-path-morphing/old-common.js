function ringToLineAttr(selection) {
  selection.attrs({
    x1: d => d[0][0],
    y1: d => d[0][1],
    x2: d => d[1][0],
    y2: d => d[1][1],
  });
}

function ringToRectAttr(selection) {
  selection.attrs({
    x1: d => d[0][0],
    y1: d => d[0][1],
    width: d => d[1][0] - d[0][0],
    height: d => d[1][1] - d[0][1],
  });
}

function ringToPathDataAttr(selection) {
  selection.attr('d', ring => 'M' + ring.join('L') + 'Z');
}

function segmentsToPathDataAttr(selection) {
  selection.attr('d', segments => {
    const bezierCommands = segments
      .map(([, , h2], i) => {
        const [p, h1] = segments[(i + 1) % segments.length];
        return 'C' + [h2, h1, p].join(' ');
      })
      .join(' ');
    return `M ${segments[0][0]}` + bezierCommands + 'Z';
  });
}

function newPointToCircleAttrFn(r) {
  return function(selection) {
    selection.attrs({ cx: d => d[0], cy: d => d[1], r });
  };
}
