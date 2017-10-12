import * as Callable from '../scripts/callable';
import * as Data from '../scripts/data';
import * as Elements from '../scripts/elements';
import * as _ from 'lodash-es';
import * as d3 from 'd3';

import { DataSelection, Point } from '../scripts/types';

const options = { size: 1440, viewportWidth: 1600, viewportHeight: 800 };
const pixelRatio = options.size / Math.max(options.viewportWidth, options.viewportHeight);

export function run() {
  const viewport = Elements.newViewport(options);

  const hippo = `M 139.8 364.88 C 142.54 328.14 155.9 295.8 179.9 267.82 C 206.94 236.22 240.82 220.42 281.53 220.42 C 297.01 220.42 320.01 222.88 350.55 227.72 C 381.1 232.6 404.1 235 419.6 235 C 443.28 235 477.45 243.84 522.1 261.47 C 530.03 264.47 539.58 272.71 550.8 286.07 C 557.2 293.95 567.07 305.83 580.43 321.63 C 583.47 323.77 587.43 326.93 592.3 331.23 C 597.15 335.45 600.5 337.29 602.3 336.68 C 602.9 334.84 604.44 332.28 606.87 328.94 C 608.07 327.72 608.83 327.11 609.13 327.11 L 611.88 328.95 C 612.78 329.57 613.08 331.37 612.78 334.41 C 612.18 339.88 611.88 341.55 611.88 339.41 C 611.55 342.46 611.12 344.41 610.5 345.36 C 606.55 352.03 605.02 357.21 605.95 360.83 C 606.87 364.16 609.72 369.5 614.6 376.79 C 619.46 384.09 622.18 389.55 622.8 393.19 C 622.5 395.92 622.36 400.31 622.36 406.41 L 617.79 417.79 C 617.79 426.29 627.65 440.89 647.39 461.57 C 656.83 465.79 661.51 480.39 661.51 505.27 C 661.51 524.75 645.43 534.45 613.24 534.45 C 608.98 534.45 604.44 534.32 599.56 533.98 C 596.23 532.78 591.36 531.42 584.99 529.91 C 577.39 528.97 572.23 526.41 569.51 522.13 C 564.63 515.18 556.73 508.63 545.81 502.55 C 543.97 501.67 541.31 498.33 537.81 492.55 C 534.31 486.75 531.21 483.12 528.49 481.59 C 525.77 480.09 521.81 479.77 516.63 480.71 C 507.83 482.21 502.95 482.97 502.06 482.97 C 499.92 482.97 496.81 482.37 492.71 481.14 C 488.61 479.92 485.66 479.31 483.81 479.31 C 481.71 489.04 481.23 498.46 482.46 507.56 C 482.76 510.01 484.29 511.99 487.01 513.48 C 491.28 516.53 493.55 518.18 493.86 518.53 C 496.58 520.63 499.48 524.13 502.51 528.97 C 503.11 530.82 501.98 533.92 499.09 538.31 C 496.19 542.71 493.86 545.31 492.02 546.05 C 490.22 546.85 486.26 547.23 480.18 547.23 C 471.35 547.23 467.88 547.36 469.7 547.66 C 457.56 545.83 450.72 544.78 449.2 544.5 C 441.6 542.96 435.06 540.55 429.6 537.2 C 426.85 535.37 423.7 526.85 420.05 511.66 C 416.37 495.26 413.33 485.39 410.91 482.03 C 410.31 481.13 409.56 480.7 408.65 480.7 C 407.12 480.7 404.6 482.2 401.12 485.26 C 397.62 488.26 395.26 489.91 394.07 490.26 C 389.81 508.16 387.67 516.66 387.67 515.74 C 387.67 522.74 389.63 528.64 393.57 533.51 C 397.52 538.37 401.64 543.08 405.9 547.61 C 411.06 553.41 413.64 558.41 413.64 562.66 C 413.64 565.06 412.89 567.19 411.36 569.04 C 404.96 576.92 394.33 580.88 379.44 580.88 C 362.74 580.88 351.8 578.6 346.64 574.04 C 339.94 568.27 335.7 562.18 333.89 555.84 C 333.59 554.31 332.83 549.74 331.61 542.17 C 331.01 537.59 329.63 534.87 327.53 533.97 C 321.43 533.07 313.83 531.41 304.75 528.97 C 302.9 527.77 300.93 524.72 298.8 519.87 C 294.86 510.47 291.97 504.07 290.14 500.72 C 281 496.17 266.42 491.04 246.37 485.28 C 245.45 487.11 245.02 489.65 245.02 493 C 248.36 497.26 253.36 503.8 260.05 512.58 C 265.53 519.88 268.27 526.88 268.27 533.55 C 268.27 546.33 260.07 552.68 243.67 552.68 C 231.2 552.68 222.7 551.8 218.13 549.98 C 211.46 547.24 205.83 540.83 201.28 530.84 C 193.68 514.09 189.43 504.68 188.52 502.57 C 183.65 491.34 180.32 481.43 178.52 472.91 C 177.28 466.85 175.45 457.55 173.02 445.11 C 170.92 434.81 167.57 426.74 163.02 420.97 C 146.28 399.37 138.52 380.67 139.75 364.89 Z`;
  const elephant = `M 1237.47 219.67 C 1249.57 219.67 1261.3 226.67 1272.7 240.67 C 1284.08 254.65 1290.67 261.65 1292.46 261.65 L 1309.58 261.65 C 1346.58 261.65 1375.23 280.17 1395.53 317.2 C 1400.88 327.57 1409.05 342.8 1420.11 362.9 C 1431.14 383.04 1443.98 397.9 1458.59 407.53 C 1474.96 418.23 1491.51 424.13 1508.23 425.16 C 1516.05 425.52 1524.63 424.08 1533.89 420.86 C 1542.09 417.28 1550.25 413.69 1558.43 410.11 L 1563.77 421.98 C 1537.44 442.18 1512.34 452.62 1488.47 453.34 C 1462.87 454.04 1435.25 447.82 1405.71 434.69 C 1430.98 463.89 1452.71 481.69 1470.87 488.09 L 1466.6 492.39 C 1434.55 486.69 1405 470.29 1377.94 443.24 L 1356.57 456 C 1356.57 457.43 1355.24 458.94 1352.57 460.53 C 1349.9 462.13 1348.72 463.43 1349.07 464.51 C 1350.51 469.15 1357.82 480.51 1370.97 498.58 C 1384.17 516.71 1390.74 526.28 1390.74 527.33 C 1390.74 530.53 1386.64 533.73 1378.44 536.93 C 1370.27 540.11 1365.84 543.67 1365.12 547.57 C 1364.4 550.77 1365.45 554.67 1368.32 559.27 C 1371.15 563.91 1372.58 566.71 1372.58 567.81 C 1372.58 574.89 1366.35 579.31 1353.91 581.11 C 1351.76 581.45 1344.99 581.64 1333.61 581.64 C 1312.26 581.64 1296.94 576.84 1287.68 567.3 C 1280.21 559.14 1274.32 544.24 1270.05 522.63 C 1268.61 515.2 1266.15 501.9 1262.58 482.73 C 1226.28 491.99 1188.88 496.63 1150.41 496.63 C 1126.91 496.63 1101.45 494.86 1074.03 491.28 C 1078.67 503.04 1085.25 522.63 1093.83 550.04 C 1076.03 547.54 1054.63 543.99 1029.73 539.34 C 1018.68 556.07 1009.23 564.1 1001.41 563.38 C 987.51 562.33 967.57 555.38 941.59 542.58 C 935.17 539.38 931.99 534.56 931.99 528.15 C 931.99 521.75 936.97 509.99 946.93 492.9 C 956.88 475.82 962.23 463.9 962.93 457.12 C 963.66 451.04 961.91 442.72 957.63 432.02 C 952.29 418.12 949.25 409.07 948.53 404.77 L 950.69 404.77 L 946.41 391.95 C 930.01 409.75 915.06 422.75 901.53 430.95 C 885.85 440.55 867.33 446.81 845.98 449.61 C 841.71 445.38 838.88 443.24 837.44 443.24 C 863.78 431.84 889.8 413.87 915.42 389.28 C 916.52 388.21 923.25 383.42 935.74 374.84 C 942.84 370.22 947.11 364.74 948.54 358.34 C 957.44 322.74 975.6 297.59 1003.01 282.99 C 1025.43 271.25 1056.96 265.39 1097.53 265.39 C 1116.05 265.39 1133.69 266.63 1150.41 269.09 C 1158.24 271.25 1170.71 273.76 1187.81 276.59 C 1189.24 262.43 1194.21 249.84 1202.76 238.85 C 1212.39 226.07 1223.96 219.68 1237.48 219.68 Z`;

  function extractEndPoints(pathData: string) {
    const cmds = pathData.split(' ');
    let i = 0;
    const endPoints: Point[] = [];
    while (i < cmds.length) {
      const curr = cmds[i];
      if (curr === 'M' || curr === 'L') {
        endPoints.push([+cmds[i + 1], +cmds[i + 2]]);
        i += 3;
      } else if (curr === 'C') {
        endPoints.push([+cmds[i + 5], +cmds[i + 6]]);
        i += 7;
      } else if (curr === 'Z') {
        endPoints.push([...endPoints[0]] as Point);
        i += 1;
      } else {
        throw new Error('command type not supported: ' + curr);
      }
    }
    return endPoints;
  }

  function showSegments(
    fromContainer: DataSelection,
    fromPathData: string,
    toContainer: DataSelection,
    toPathData: string,
  ) {
    fromContainer.append('path.filled').attrs({ d: fromPathData });
    toContainer.append('path.filled').attrs({ d: toPathData });

    const fromPoints = extractEndPoints(fromPathData);
    const toPoints = extractEndPoints(toPathData);
    const minNumPoints = Math.min(fromPoints.length, toPoints.length);

    const info = [[fromContainer, fromPoints], [toContainer, toPoints]] as [
      DataSelection,
      Point[]
    ][];
    for (const [container, points] of info) {
      // JOIN new data with old elements.
      const segments = container.selectAll('circle.segment').data(points);

      // EXIT old elements not present in new data.
      segments.exit().remove();

      // UPDATE old elements present in new data.
      segments.attrs({
        cx: d => d[0],
        cy: d => d[1],
        fill: (d, i) =>
          i < minNumPoints ? d3.interpolateCool(i / points.length * 0.7 + 0.15) : '#D32F2F',
      });

      // ENTER new elements present in new data.
      segments
        .enter()
        .append('circle.segment')
        .attrs({
          cx: d => d[0],
          cy: d => d[1],
          r: () => 5,
          fill: (_, i) =>
            i < minNumPoints ? d3.interpolateCool(i / points.length * 0.7 + 0.15) : '#D32F2F',
        });
    }
  }

  function morph(fromContainer: DataSelection, toContainer: DataSelection) {
    const fromPath = fromContainer.append('path.filled-stroked').attrs({ d: hippo });
    const toPath = toContainer.append('path.dashed').attrs({ d: elephant });

    fromPath
      .transition()
      .duration(2000)
      .attr('d', elephant);
    // .attrTween('d', d => d3.interpolatePath(hippo, elephant));
  }

  const fromContainer = viewport.append('g.from');
  const toContainer = viewport.append('g.to');

  showSegments(fromContainer, hippo, toContainer, elephant);
  morph(fromContainer, toContainer);
}
