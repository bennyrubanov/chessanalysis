import {
  ALL_SQUARES,
  ALL_UNAMBIGUOUS_PIECE_SYMBOLS,
  Chess,
  PrettyMove,
  UnambiguousPieceSymbol,
} from '../../cjsmin/src/chess';
import { FileReaderGame } from '../types';

export function createBoardMap(): BoardMap {
  /**
   * i.e.
   * a1: {
   *   k: {
   *    captured: 0,
   *    captures: 0,
   *   },
   * },
   */
  const squareCaptureInfo: {
    [key: string]: {
      [key: string]: {
        captured: number;
        captures: number;
        revengeKills: number;
      };
    };
  } = {};

  for (const square of ALL_SQUARES) {
    squareCaptureInfo[square] = {};
    for (const piece of ALL_UNAMBIGUOUS_PIECE_SYMBOLS) {
      squareCaptureInfo[square][piece] = {
        captured: 0,
        captures: 0,
        revengeKills: 0,
      };
    }
  }

  return squareCaptureInfo;
}

interface BoardMap {
  [key: string]: {
    [key: string]: {
      captured: number;
      captures: number;
      revengeKills: number;
    };
  };
}

export function trackCaptures(boardMap: BoardMap, moves: PrettyMove[]) {
  let lastMove: PrettyMove;
  let i = 0;
  for (const move of moves) {
    if (move.capture) {
      boardMap[move.to][move.unambiguousSymbol].captures++;
      boardMap[move.to][move.capture.unambiguousSymbol].captured++;
      // revenge kills
      if (lastMove.capture && move.to === lastMove.to) {
        boardMap[move.to][move.unambiguousSymbol].revengeKills++;
      }
    }
    lastMove = move;
    i++;
  }
}

function uapMap() {
  const map = {};
  for (const uap of ALL_UNAMBIGUOUS_PIECE_SYMBOLS) {
    map[uap] = { killStreaks: 0 };
  }
  return map;
}

function getMaxKillStreak(
  uapMap: any,
  moves: PrettyMove[],
  startingIndex: 0 | 1 // assume games have at least 2 moves
) {
  let i = startingIndex;
  let streakLength = 0;
  let streakPiece: UnambiguousPieceSymbol;

  while (i < moves.length) {
    const move = moves[i];
    if (move.capture) {
      if (streakLength === 0) {
        streakPiece = move.unambiguousSymbol;
        streakLength++;
      } else if (streakPiece === move.unambiguousSymbol) {
        streakLength++;
      } else {
        uapMap[streakPiece].killStreaks = Math.max(
          uapMap[streakPiece].killStreaks,
          streakLength
        );
        streakLength = 0;
      }
    }
    i += 2;
  }
  uapMap[streakPiece].killStreaks = Math.max(
    uapMap[streakPiece].killStreaks,
    streakLength
  );
}

export function getBWKillStreaks(moves: PrettyMove[]) {
  const tracker = uapMap();
  getMaxKillStreak(tracker, moves, 0);
  getMaxKillStreak(tracker, moves, 1);

  return tracker;
}

// calculates piece with highest K/D ratio and also contains assists by that piece
export async function getKillDeathRatios(games: FileReaderGame[]) {
  console.time('Task 4: getKillDeathRatios');
  // create an object to track kills, deaths, and assists of each piece
  // The killsDeathsAssistsMap is an object where each key is a piece and the value is another object with kills, deaths, and assists properties.
  const killsDeathsAssistsMap: {
    [key: string]: { kills: number; deaths: number; assists: number };
  } = {};

  const killDeathRatios = {};

  // look at each game and find the piece with the largest kill/death ratio
  for (const game of games) {
    const chess = new Chess();
    const moveGenerator = chess.historyGenerator(game.moves);

    for (let moveInfo of moveGenerator) {
      const { move, board } = moveInfo;

      let piece = move.unambiguousSymbol;

      if (!killsDeathsAssistsMap[piece]) {
        killsDeathsAssistsMap[piece] = { kills: 0, deaths: 0, assists: 0 };
      }

      const movedPiece = move.unambiguousSymbol;

      // Check if movedPiece is not undefined
      if (movedPiece) {
        // update the kill & death counts of movedPiece
        if (move.capture) {
          killsDeathsAssistsMap[movedPiece].kills++;

          const capturedPiece = board[move.toIndex]?.unambiguousSymbol; // Get the unambiguous piece symbol from the board state

          if (capturedPiece) {
            if (!killsDeathsAssistsMap[capturedPiece]) {
              killsDeathsAssistsMap[capturedPiece] = {
                kills: 0,
                deaths: 0,
                assists: 0,
              };
            }
            killsDeathsAssistsMap[capturedPiece].deaths++;
          }
        }
      } else {
        console.log('No piece found for square:', move.from);
        console.log('move: ', move);
      }
    }

    // Check if the game is in checkmate after the last move
    if (chess.isCheckmate()) {
      const { unambigMatingPiece, unambigMatedPiece } = getMateAndAssists(
        game.moves
      );

      if (unambigMatingPiece) {
        killsDeathsAssistsMap[unambigMatingPiece].kills++;
      }

      if (unambigMatedPiece) {
        killsDeathsAssistsMap[unambigMatedPiece].deaths++;
      }
    }
  }

  // calculate the kill death ratios of each piece
  for (const piece of Object.keys(killsDeathsAssistsMap)) {
    const kills = killsDeathsAssistsMap[piece].kills;
    const deaths = killsDeathsAssistsMap[piece].deaths || 0;
    if (deaths !== 0) {
      killDeathRatios[piece] = kills / deaths;
    }
  }

  // find the piece with the highest kill death ratio
  let maxKillDeathRatio = 0;
  let pieceWithHighestKDRatio = null;

  for (const piece of Object.keys(killDeathRatios)) {
    const ratio = killDeathRatios[piece];
    if (ratio > maxKillDeathRatio) {
      maxKillDeathRatio = ratio;
      pieceWithHighestKDRatio = piece;
    }
  }

  // KDR facts
  console.log('KDR FACTS (INCLUDING CHECKMATES AS KILLS):');
  console.log(
    `Piece with the highest kill death ratio: ${pieceWithHighestKDRatio}`
  );
  console.log('Kills, Deaths, and Assists for each unambiguous piece:'),
    console.table(killsDeathsAssistsMap);
  console.log(
    'Kill Death Ratios for each unambiguous piece: ' +
      JSON.stringify(killDeathRatios, null, 2)
  );

  console.timeEnd('Task 4: getKillDeathRatios');
  return {
    killDeathRatios,
    killsDeathsAssistsMap,
    pieceWithHighestKDRatio,
  };
}

// One edge case currently unaccounted for is when pieces "share" a mate, or check. This can be at most 2 due to discovery checks (currently we disregard this by just referring to whatever the PGN says. If the piece that moves causes checkmate, then it is the "mating piece")
export function getMateAndAssists(pgnMoveLine: string) {
  const chess = new Chess();
  const moveGenerator = chess.historyGenerator(pgnMoveLine);

  let matingPiece,
    assistingPiece,
    hockeyAssist,
    unambigMatingPiece,
    unambigMatedPiece,
    unambigAssistingPiece,
    unambigHockeyAssistPiece,
    lastPieceMoved;

  // Keep track of the last few moves
  let lastFewMoves: PrettyMove[] = [];

  for (let moveInfo of moveGenerator) {
    const { move, board } = moveInfo;

    // Add the current move to the start of the array
    lastFewMoves.unshift(move);

    // If we have more than 5 moves in the array, remove the oldest one
    if (lastFewMoves.length > 5) {
      lastFewMoves.pop();
    }

    if (move?.originalString.includes('#')) {
      matingPiece = move.piece;
      unambigMatingPiece = move.unambiguousSymbol;

      // Determine the color of the mated king
      const matedKingColor = move.color === 'w' ? 'b' : 'w';
      unambigMatedPiece = matedKingColor === 'w' ? 'K' : 'k';

      // If mate see if also assist
      if (
        lastFewMoves[2] &&
        lastFewMoves[2].originalString.includes('+') &&
        lastFewMoves[2].unambiguousSymbol !== unambigMatingPiece
      ) {
        assistingPiece = lastFewMoves[2].piece;
        unambigAssistingPiece = lastFewMoves[2].unambiguousSymbol;

        // If assist check for hockey assist
        if (
          lastFewMoves[4] &&
          lastFewMoves[4].originalString.includes('+') &&
          lastFewMoves[4].unambiguousSymbol !== unambigAssistingPiece &&
          lastFewMoves[4].unambiguousSymbol !== unambigMatingPiece
        ) {
          hockeyAssist = lastFewMoves[4].piece;
          unambigHockeyAssistPiece = lastFewMoves[4].unambiguousSymbol;
        }
      }
    }
  }
  // console.log('mating piece: ', matingPiece);
  // console.log('assisting piece: ', assistingPiece);
  // console.log('hockey assisting piece: ', hockeyAssist);
  // console.log('unambig mating piece: ', unambigMatingPiece);
  // console.log('unambig mated piece: ', unambigMatedPiece);
  // console.log('unambig assisting piece: ', unambigAssistingPiece);
  // console.log('unambig hockey assisting piece: ', unambigHockeyAssistPiece);
  // console.log('last piece moved: ', lastPieceMoved);

  return {
    matingPiece,
    assistingPiece,
    hockeyAssist,
    unambigMatingPiece,
    unambigMatedPiece,
    unambigAssistingPiece,
    unambigHockeyAssistPiece,
    lastPieceMoved,
  };
}
