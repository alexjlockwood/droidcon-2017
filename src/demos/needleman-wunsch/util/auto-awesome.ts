import * as NeedlemanWunsch from './needleman-wunsch';
import * as _ from 'lib/lodash';

import { distance, samePoint } from 'scripts/math';

import { Command } from 'scripts/paths/command';

type Path = ReadonlyArray<Command>;

/**
 * Takes two arbitrary paths, calculates a best-estimate alignment of the two,
 * and then inserts no-op commands into the alignment gaps to make the two paths
 * compatible with each other.
 */
export function fix({ from, to }: { from: Path; to: Path }) {
  // Use the path with the larger number of commands as the 'from' path.
  const shouldSwap = from.length < to.length;
  if (shouldSwap) {
    [from, to] = [to, from];
  }
  let { from: fixedFrom, to: fixedTo } = align({ from, to });
  if (shouldSwap) {
    [fixedFrom, fixedTo] = [fixedTo, fixedFrom];
  }
  return permute({ from: fixedFrom, to: fixedTo });
}

/**
 * Aligns two paths using the Needleman-Wunsch algorithm.
 */
function align({ from, to }: { from: Path; to: Path }) {
  // Create and return a list of reversed and shifted from paths to test.
  // Each generated 'from path' will be aligned with the target 'to path'.
  const fromPaths: Path[] = _.flatMap([from, reverseCommands(from)], p => {
    const paths = [p];
    if (isClosed(p)) {
      for (let i = 1; i < p.length - 1; i++) {
        // TODO: we need to find a way to reduce the number of paths to try.
        paths.push(shiftCommands(p, i));
      }
    }
    return paths;
  });

  // The scoring function to use to calculate the alignment. Convert-able
  // commands are considered matches. However, the farther away the points
  // are from each other, the lower the score.
  const getScoreFn = (a: Command, b: Command) => {
    const charA = a.type;
    const charB = b.type;
    if (charA !== charB && !a.canConvertTo(charB) && !b.canConvertTo(charA)) {
      return NeedlemanWunsch.MISMATCH;
    }
    return 1 / Math.max(NeedlemanWunsch.MATCH, distance(a.end, b.end));
  };

  const alignmentInfos = fromPaths.map(generatedFromPath => {
    return {
      generatedFromPath,
      alignment: NeedlemanWunsch.align({ from: generatedFromPath, to }, getScoreFn),
    };
  });

  // Find the alignment with the highest score.
  const alignmentInfo = alignmentInfos.reduce((prev, curr) => {
    const prevScore = prev.alignment.score;
    const currScore = curr.alignment.score;
    return prevScore > currScore ? prev : curr;
  });

  interface CmdInfo {
    readonly isGap: boolean;
    readonly isNextGap: boolean;
    readonly nextCmdIdx: number;
  }

  // For each alignment, determine whether it and its neighbor is a gap.
  const processAlignmentsFn = (alignments: Path): ReadonlyArray<CmdInfo> => {
    let nextCmdIdx = 0;
    return alignments.map((alignment, i) => {
      const isGap = !alignment;
      const isNextGap = i + 1 < alignments.length && !alignments[i + 1];
      if (!isGap) {
        nextCmdIdx++;
      }
      return { isGap, isNextGap, nextCmdIdx } as CmdInfo;
    });
  };

  const fromCmdInfos = processAlignmentsFn(alignmentInfo.alignment.from);
  const toCmdInfos = processAlignmentsFn(alignmentInfo.alignment.to);

  // Process each list of alignments. Each streak of gaps represents a series
  // of one or more splits we'll perform on the path.
  const createGapStreaksFn = (cmdInfos: ReadonlyArray<CmdInfo>) => {
    const gapStreaks: CmdInfo[][] = [];
    let currentGapStreak: CmdInfo[] = [];
    for (const cmdInfo of cmdInfos) {
      if (cmdInfo.isGap) {
        currentGapStreak.push(cmdInfo);
        if (!cmdInfo.isNextGap) {
          gapStreaks.push(currentGapStreak);
          currentGapStreak = [];
        }
      }
    }
    return gapStreaks as CmdInfo[][];
  };
  const fromGapGroups = createGapStreaksFn(fromCmdInfos);
  const toGapGroups = createGapStreaksFn(toCmdInfos);

  // Fill in the gaps by applying linear subdivide batch splits.
  const applySplitsFn = (path: Path, gapGroups: CmdInfo[][]) => {
    const splitOps = new Map<number, number>();
    for (let i = gapGroups.length - 1; i >= 0; i--) {
      const gapGroup = gapGroups[i];
      // Clamp the index between 1 and numCommands - 1 to account for cases
      // where the alignment algorithm attempts to append new commands to the
      // front and back of the sequence.
      const cmdIdx = _.clamp(_.last(gapGroup).nextCmdIdx, 1, path.length - 1);
      splitOps.set(cmdIdx, gapGroup.length + (splitOps.has(cmdIdx) ? splitOps.get(cmdIdx) : 0));
    }
    return _.flatMap(path, (cmd, cmdIdx) => {
      return splitOps.has(cmdIdx) ? cmd.split(splitOps.get(cmdIdx)) : cmd;
    });
  };

  const fromPathResult = applySplitsFn(alignmentInfo.generatedFromPath, fromGapGroups);
  const toPathResult = applySplitsFn(to, toGapGroups);

  // Finally, convert the commands before returning the result.
  return convert({ from: fromPathResult, to: toPathResult });
}

/**
 * Takes two paths with an equal number of commands and makes them compatible
 * by converting each pair one-by-one.
 */
function convert({ from, to }: { from: Path; to: Path }): { from: Path; to: Path } {
  const numFrom = from.length;
  const numTo = to.length;
  if (numFrom !== numTo) {
    // Only auto convert when the number of commands in both paths are equal.
    return { from, to };
  }
  const fromCmds: Command[] = [];
  const toCmds: Command[] = [];
  for (let cmdIdx = 0; cmdIdx < numFrom; cmdIdx++) {
    let fromCmd = from[cmdIdx];
    let toCmd = to[cmdIdx];
    if (fromCmd.canConvertTo(toCmd.type)) {
      fromCmd = fromCmd.convertTo(toCmd.type);
    } else if (toCmd.canConvertTo(fromCmd.type)) {
      toCmd = toCmd.convertTo(fromCmd.type);
    }
    fromCmds.push(fromCmd);
    toCmds.push(toCmd);
  }
  return { from: fromCmds, to: toCmds };
}

/**
 * Permutes two paths based on their relative distances from each other.
 */
function permute({ from, to }: { from: Path; to: Path }) {
  if (isClockwise(from) !== isClockwise(to)) {
    // Make sure the paths share the same direction.
    to = reverseCommands(to);
  }

  // Create and return a list of reversed and shifted from paths to test.
  // Each generated 'from path' will be aligned with the target 'to path'.
  const fromPaths: Path[] = [from];
  if (isClosed(from)) {
    for (let i = 1; i < from.length - 1; i++) {
      // TODO: we need to find a way to reduce the number of paths to try.
      fromPaths.push(shiftCommands(from, i));
    }
  }

  let bestFromPath = from;
  let min = Infinity;
  for (const fromCmds of fromPaths) {
    let sumOfSqs = 0;
    const toCmds = to;
    fromCmds.forEach((c, cmdIdx) => (sumOfSqs += Math.pow(distance(c.end, toCmds[cmdIdx].end), 2)));
    if (sumOfSqs < min) {
      min = sumOfSqs;
      bestFromPath = fromCmds;
    }
  }

  return { from: bestFromPath, to };
}

/**
 * Returns a list of reversed commands.
 */
function reverseCommands(commands: Path): Path {
  if (commands.length <= 1) {
    return [...commands];
  }
  const cmds = [...commands];

  // If the last command is a 'Z', replace it with a line before we reverse.
  if (_.last(cmds).type === 'Z') {
    // TODO: replacing the 'Z' messes up certain stroke-linejoin values
    cmds[cmds.length - 1] = Command.create('L', _.last(cmds).points);
  }

  // Reverse the commands.
  const newCmds: Command[] = [];
  for (let i = cmds.length - 1; i > 0; i--) {
    const { type, points } = cmds[i];
    newCmds.push(Command.create(type, [...points].reverse()));
  }
  newCmds.unshift(Command.create(cmds[0].type, [cmds[0].start, newCmds[0].start]));
  return newCmds;
}

/**
 * Returns a list of shifted commands.
 */
function shiftCommands(commands: Path, numShifts = 0): Path {
  const numCommands = commands.length;
  if (numShifts === 0 || numCommands === 1 || !isClosed(commands)) {
    // If there is no shift offset, the path is only one command long,
    // or if the path is not closed, then do nothing.
    return [...commands];
  }
  const cmds = [...commands];

  // If the last command is a 'Z', replace it with a line before we shift.
  if (_.last(cmds).type === 'Z') {
    // TODO: replacing the 'Z' messes up certain stroke-linejoin values
    cmds[cmds.length - 1] = Command.create('L', _.last(cmds).points);
  }

  const newCmds: Command[] = [];

  // Handle these case separately cause they are annoying and I'm sick of edge cases.
  if (numShifts === 1) {
    newCmds.push(Command.create(cmds[0].type, [cmds[0].start, cmds[1].end]));
    for (let i = 2; i < cmds.length; i++) {
      newCmds.push(cmds[i]);
    }
    newCmds.push(cmds[1]);
    return newCmds;
  }
  if (numShifts === numCommands - 1) {
    newCmds.push(Command.create(cmds[0].type, [cmds[0].start, cmds[numCommands - 2].end]));
    newCmds.push(_.last(cmds));
    for (let i = 1; i < cmds.length - 1; i++) {
      newCmds.push(cmds[i]);
    }
    return newCmds;
  }

  // Shift the sequence of commands. After the shift, the original move
  // command will be at index 'numCommands - shiftOffset'.
  for (let i = 0; i < numCommands; i++) {
    newCmds.push(cmds[(i + numShifts) % numCommands]);
  }

  const prevMoveCmd = newCmds.splice(numCommands - numShifts, 1)[0];
  newCmds.push(newCmds.shift());
  newCmds.unshift(Command.create(cmds[0].type, [prevMoveCmd.start, _.last(newCmds).end]));
  return newCmds;
}

function isClosed(cmds: Path) {
  return cmds.length > 0 && samePoint(cmds[0].end, _.last(cmds).end);
}

function isClockwise(cmds: Path) {
  let sum = 0;
  for (let i = 0; i < cmds.length; i++) {
    const { end: [x0, y0] } = cmds[i];
    const { end: [x1, y1] } = cmds[(i + 1) % cmds.length];
    sum += (x1 - x0) * (y1 - y0);
  }
  return sum >= 0;
}
