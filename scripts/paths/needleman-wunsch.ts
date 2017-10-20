import * as _ from 'lib/lodash';

// Needleman-Wunsch scoring function constants.
export const MATCH = 1;
export const MISMATCH = -1;
export const INDEL = 0;

/**
 * Aligns two sequences of objects using the Needleman-Wunsch algorithm.
 * Returns an array of objects with undefined slots that represent gaps.
 */
export function align<T>(
  sequences: Readonly<{ from: ReadonlyArray<T>; to: ReadonlyArray<T> }>,
  scoringFn: (t1: T, t2: T) => number,
) {
  const { from, to } = sequences;
  const listA: T[] = [...from];
  const listB: T[] = [...to];
  const alignedListA: T[] = [];
  const alignedListB: T[] = [];

  // Add dummy nodes at the first position of each list.
  listA.unshift(undefined);
  listB.unshift(undefined);

  let i: number;
  let j: number;

  // Initialize the scoring matrix.
  const matrix: number[][] = [];
  for (i = 0; i < listA.length; i++) {
    const row: number[] = [];
    for (j = 0; j < listB.length; j++) {
      row.push(i === 0 ? j * INDEL : j === 0 ? i * INDEL : 0);
    }
    matrix.push(row);
  }

  // Process the scoring matrix.
  for (i = 1; i < listA.length; i++) {
    for (j = 1; j < listB.length; j++) {
      const match = matrix[i - 1][j - 1] + scoringFn(listA[i], listB[j]);
      const ins = matrix[i][j - 1] + INDEL;
      const del = matrix[i - 1][j] + INDEL;
      matrix[i][j] = Math.max(match, ins, del);
    }
  }

  // Backtracking.
  i = listA.length - 1;
  j = listB.length - 1;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && matrix[i][j] === matrix[i - 1][j - 1] + scoringFn(listA[i], listB[j])) {
      alignedListA.unshift(listA[i--]);
      alignedListB.unshift(listB[j--]);
    } else if (i > 0 && matrix[i][j] === matrix[i - 1][j] + INDEL) {
      alignedListA.unshift(listA[i--]);
      alignedListB.unshift(undefined);
    } else {
      alignedListA.unshift(undefined);
      alignedListB.unshift(listB[j--]);
    }
  }
  return {
    from: alignedListA,
    to: alignedListB,
    score: _.last(_.last(matrix)),
  };
}
