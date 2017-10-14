import * as d3 from 'lib/d3';
import * as topojson from 'topojson';

import earcut from 'earcut';

export function run() {
  const width = 960;
  const height = 500;
  const svg = d3
    .select('body')
    .append('svg')
    .attrs({ width, height });

  d3.json('../../assets/us.topo.json', (err, us) => {
    const states = topojson
      .feature(us, (us as any).objects.states)
      .features.map(d => d.geometry.coordinates[0]);
    d3.shuffle(states);
    morph(states);
  });

  function morph(states) {
    const source = states.shift();
    const destination = states[0];
    const multi = subdivide(source);

    states.push(source);

    d3
      .queue(1)
      .defer(tween, [source], multi)
      .defer(tween, multi, [destination])
      .await(err => {
        if (err) {
          throw err;
        }
        morph(states);
      });
  }

  function tween(fr, to, cb) {
    let pairs;

    if (to.length === 1) {
      pairs = getTweenablePairs(fr, triangulate(to[0], fr.length));
    } else {
      pairs = getTweenablePairs(triangulate(fr[0], to.length), to, true);
    }

    svg
      .call(updatePaths, pairs)
      .selectAll('path')
      .transition()
      .delay(fr.length > 1 ? 0 : 400)
      .duration(2500)
      .style('fill', (d, i) => (fr.length > 1 ? '#ccc' : d3.interpolateCool(i / pairs.length)))
      .attrTween('d', (d, i) => d3.interpolateString(join(d[0]), join(d[1])))
      .on('end', () => {
        if (to.length === 1) {
          svg
            .call(updatePaths, to)
            .selectAll('path')
            .attr('d', join);
        }

        setTimeout(cb, 0);
      });
  }

  function updatePaths(sel, pairs) {
    const paths = sel.selectAll('path').data(pairs);
    paths.enter().append('path');
    paths.exit().remove();
  }

  function triangulate(ring, numPieces) {
    const vertices = ring.reduce(function(arr, point) {
      return arr.concat(point);
    }, []);
    const cuts = earcut(vertices);
    const triangles = [];
    let topology;

    for (let i = 0, l = cuts.length; i < l; i += 3) {
      // Save each triangle as segments [a, b], [b, c], [c, a].
      triangles.push([[cuts[i], cuts[i + 1]], [cuts[i + 1], cuts[i + 2]], [cuts[i + 2], cuts[i]]]);
    }

    topology = createTopology(triangles, ring);
    return collapse(topology, numPieces);
  }

  // Merge polygons into neighbors one at a time until only numPieces remain
  function collapse(topology, numPieces) {
    const geometries = topology.objects.triangles.geometries,
      bisector = d3.bisector(d => (d as any).area).left;

    while (geometries.length > numPieces) {
      mergeSmallestFeature();
    }

    return topojson
      .feature(topology, topology.objects.triangles)
      .features.map(f => f.geometry.coordinates[0]);

    // Shuffle just for fun.
    function mergeSmallestFeature() {
      const smallest = geometries[0];
      const neighborIndex = d3.shuffle(topojson.neighbors(geometries)[0])[0] as number;
      const neighbor = geometries[neighborIndex];
      const merged = topojson.mergeArcs(topology, [smallest, neighbor]);

      // MultiPolygon -> Polygon
      merged.area = smallest.area + neighbor.area;
      merged.type = 'Polygon';
      merged.arcs = merged.arcs[0];

      // Delete smallest and its chosen neighbor.
      geometries.splice(neighborIndex, 1);
      geometries.shift();

      // Add new merged shape in sorted order.
      geometries.splice(bisector(geometries, merged.area), 0, merged);
    }
  }

  function createTopology(triangles, points) {
    const arcIndices = {};
    const topology = {
      type: 'Topology',
      objects: {
        triangles: {
          type: 'GeometryCollection',
          geometries: [],
        },
      },
      arcs: [],
    };

    triangles.forEach(triangle => {
      const geometry = [];

      triangle.forEach((arc, i) => {
        const slug = arc[0] < arc[1] ? arc.join(',') : arc[1] + ',' + arc[0];
        const coordinates = arc.map(pointIndex => points[pointIndex]);

        if (slug in arcIndices) {
          // tslint:disable-next-line no-bitwise
          geometry.push(~arcIndices[slug]);
        } else {
          geometry.push((arcIndices[slug] = topology.arcs.length));
          topology.arcs.push(coordinates);
        }
      });

      topology.objects.triangles.geometries.push({
        type: 'Polygon',
        area: Math.abs(d3.polygonArea(triangle.map(d => points[d[0]]))),
        arcs: [geometry],
      });
    });

    // Sort smallest first.
    topology.objects.triangles.geometries.sort((a, b) => a.area - b.area);

    return topology;
  }

  function getTweenablePairs(start, end, out?) {
    // Rearrange order of polygons for least movement.
    if (out) {
      start = closestCentroids(start, end);
    } else {
      end = closestCentroids(end, start);
    }

    return start.map((a, i) => align(a.slice(0), end[i].slice(0)));
  }

  function align(a, b) {
    // Matching rotation.
    if (d3.polygonArea(a) * d3.polygonArea(b) < 0) {
      a.reverse();
    }

    // Smooth out by bisecting long triangulation cuts.
    bisectSegments(a, 25);
    bisectSegments(b, 25);

    // Same number of points on each ring
    if (a.length < b.length) {
      addPoints(a, b.length - a.length);
    } else if (b.length < a.length) {
      addPoints(b, a.length - b.length);
    }

    // Wind the first to minimize sum-of-squares distance to the second.
    return [wind(a, b), b];
  }

  function addPoints(ring, numPoints) {
    const desiredLength = ring.length + numPoints;
    const step = d3.polygonLength(ring) / numPoints;

    let i = 0,
      cursor = 0,
      insertAt = step / 2;

    while (ring.length < desiredLength) {
      const a = ring[i];
      const b = ring[(i + 1) % ring.length];

      const segment = distanceBetween(a, b);

      if (insertAt <= cursor + segment) {
        ring.splice(i + 1, 0, pointBetween(a, b, (insertAt - cursor) / segment));
        insertAt += step;
        continue;
      }

      cursor += segment;
      i++;
    }
  }

  // Find best winding for first ring of pair
  function wind(ring, vs) {
    const len = ring.length;
    let min = Infinity;
    let bestOffset: number;

    for (let offset = 0; offset < len; offset++) {
      const sum = d3.sum(
        vs.map((p, i) => {
          const distance = distanceBetween(ring[(offset + i) % len], p);
          return distance * distance;
        }),
      );

      if (sum < min) {
        min = sum;
        bestOffset = offset;
      }
    }

    return ring.slice(bestOffset).concat(ring.slice(0, bestOffset));
  }

  // Find ordering of first set that minimizes squared distance between centroid pairs
  // Could loosely optimize instead of trying every permutation (would probably have to with 10+ pieces)
  function closestCentroids(start, end) {
    let min = Infinity;
    let best;
    const distances = start.map(p1 => {
      return end.map(p2 => {
        const distance = distanceBetween(d3.polygonCentroid(p1), d3.polygonCentroid(p2));
        return distance * distance;
      });
    });

    function permute(arr, order = [], sum = 0) {
      let cur, distance;

      for (let i = 0; i < arr.length; i++) {
        cur = arr.splice(i, 1);
        distance = distances[cur[0]][order.length];
        if (arr.length) {
          permute(arr.slice(), order.concat(cur), sum + distance);
          arr.splice(i, 0, cur[0]);
        } else if (sum + distance < min) {
          min = sum + distance;
          best = order.concat(cur);
        }
      }
    }

    permute(d3.range(start.length));
    return best.map(i => start[i]);
  }

  // Bisect any segment longer than x with an extra point
  function bisectSegments(ring, threshold) {
    for (let i = 0; i < ring.length - 1; i++) {
      while (distanceBetween(ring[i], ring[i + 1]) > threshold) {
        ring.splice(i + 1, 0, pointBetween(ring[i], ring[i + 1], 0.5));
      }
    }
  }

  function distanceBetween(a, b) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];

    return Math.sqrt(dx * dx + dy * dy);
  }

  function pointBetween(a, b, pct) {
    return [a[0] + (b[0] - a[0]) * pct, a[1] + (b[1] - a[1]) * pct];
  }

  // Join a ring or array of rings into a path string
  function join(geom) {
    if (typeof geom[0][0] !== 'number') {
      return geom.map(join).join(' ');
    }

    return 'M' + geom.join('L') + 'Z';
  }

  // Given a full-sized ring, return 2 - 6 smaller clones in a dice pattern
  function subdivide(ring) {
    const numClones = 2 + Math.floor(Math.random() * 5);
    const bounds = getBounds(ring);

    return d3.range(numClones).map(d => {
      let x0: number;
      let x1: number;
      let y0: number;
      let y1: number;
      if (numClones === 2) {
        x0 = d ? width / 2 : 0;
        x1 = x0 + width / 2;
        y0 = 0;
        y1 = height;
      } else if (numClones === 3) {
        x0 = d * width / 3;
        x1 = x0 + width / 3;
        y0 = d * height / 3;
        y1 = y0 + height / 3;
      } else if (numClones === 4) {
        x0 = (d % 2) * width / 2;
        x1 = x0 + width / 2;
        y0 = d < 2 ? 0 : height / 2;
        y1 = y0 + height / 2;
      } else if (numClones === 5) {
        x0 = (d < 2 ? 0 : d === 2 ? 1 : 2) * width / 3;
        x1 = x0 + width / 3;
        y0 = [0, 1, 0.5, 0, 1][d] * height / 2;
        y1 = y0 + height / 2;
      } else {
        x0 = (d % 3) * width / 3;
        x1 = x0 + width / 3;
        y0 = d < 3 ? 0 : height / 2;
        y1 = y0 + height / 2;
      }
      return ring.map(fitExtent([[x0 + 5, y0 + 5], [x1 - 5, y1 - 5]], bounds));
    });
  }

  // Raw fitExtent to avoid some projection stream kinks
  function fitExtent(extent, bounds) {
    const w = extent[1][0] - extent[0][0];
    const h = extent[1][1] - extent[0][1];
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const k = 1 / Math.max(dx / w, dy / h);
    const x = extent[0][0] - k * bounds[0][0] + (w - dx * k) / 2;
    const y = extent[0][1] - k * bounds[0][1] + (h - dy * k) / 2;
    return point => [x + k * point[0], y + k * point[1]];
  }

  function getBounds(ring) {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    ring.forEach(point => {
      if (point[0] < x0) {
        x0 = point[0];
      }
      if (point[0] > x1) {
        x1 = point[0];
      }
      if (point[1] < y0) {
        y0 = point[1];
      }
      if (point[1] > y1) {
        y1 = point[1];
      }
    });
    return [[x0, y0], [x1, y1]];
  }
}
