import { Piece, PrettyMove, UASymbol } from '../cjsmin/chess';
import { UAPMap } from '../types';
import { createUAPMap } from '../utils';
import { Metric } from './metric';

export class GameWithMostMovesMetric implements Metric {
  link: string[];
  numMoves: number;

  constructor() {
    this.clear();
  }

  clear(): void {
    this.link = [];
    this.numMoves = 0;
  }

  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata: string[]
  ) {
    if (game.length > this.numMoves) {
      this.numMoves = game.length;
      this.link = [
        metadata
          .find((item) => item.startsWith('[Site "'))
          ?.replace('[Site "', '')
          ?.replace('"]', ''),
      ];
    } else if (game.length === this.numMoves) {
      this.link.push(
        metadata
          .find((item) => item.startsWith('[Site "'))
          ?.replace('[Site "', '')
          ?.replace('"]', '')
      );
    }
  }

  aggregate() {
    return {
      gameWithMostMoves: this.link,
      gameWithMostMovesNumMoves: this.numMoves,
    };
  }

  logResults(): void {
    console.log('\n');

    console.log('MOVES FACTS:');
    console.log(`The game with the most moves played: ${this.link}`);
    console.log(`The number of moves played in that game: ${this.numMoves}`);

    console.log(
      '=============================================================='
    );
    console.log('\n');
  }
}

export class PieceLevelMoveInfoMetric implements Metric {
  totalMovesByPiece: UAPMap<{ numMoves: number }>;
  uasSingleGameMaxMoves: number;
  uasWithMostMoves: UASymbol[];
  gamesWithUasMostMoves: string[];
  gamesProcessed: number; // this could be tracked externally also, in other metrics
  averagesMap: UAPMap<{ avgMoves: number }>;
  highestAverageMoves: number;
  pieceHighestAverageMoves: UASymbol[];
  gamesWithNoCastling: number;
  castlingCounts: {
    blackKing: number;
    blackQueen: number;
    whiteKing: number;
    whiteQueen: number;
  };

  constructor() {
    this.clear();
  }

  clear(): void {
    this.totalMovesByPiece = createUAPMap({ numMoves: 0 });
    this.uasSingleGameMaxMoves = 0;
    this.uasWithMostMoves = [];
    this.gamesWithUasMostMoves = [];
    this.gamesProcessed = 0;
    this.highestAverageMoves = 0;
    this.pieceHighestAverageMoves = [];
    this.gamesWithNoCastling = 0;
    this.castlingCounts = {
      blackKing: 0,
      blackQueen: 0,
      whiteKing: 0,
      whiteQueen: 0,
    };
  }

  logResults(): void {
    console.log('PIECE LEVEL MOVE INFO FACTS:');
    console.log('The total number of moves by piece in the set of games:');
    console.table(this.totalMovesByPiece);

    console.log('The average number of moves by piece in the set of games:');
    console.table(this.averagesMap);

    console.log(`The piece(s) with the highest average number moves and the number of moves: 
      ${this.pieceHighestAverageMoves}, ${this.highestAverageMoves}`);
    console.log(
      `The piece with the most moves in a single game: ${this.uasWithMostMoves}`
    );
    console.log(
      `The number of most moves that piece made in a single game: ${this.uasSingleGameMaxMoves}`
    );
    console.log(
      `The game that piece made that many moves in: ${this.gamesWithUasMostMoves}`
    );
    console.log('\n');

    console.log(
      `The number of games with no castling: ${this.gamesWithNoCastling}`
    );
    console.log('Number of queen and king side castlings:');
    console.table(this.castlingCounts);

    console.log(
      '=============================================================='
    );
    console.log('\n');
  }

  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata: string[]
  ) {
    // update move counts of each unambiguous piece
    const currentGameStats = createUAPMap({ numMoves: 0 });
    let thisGameNumMoves = 0;

    // track if this game has no castling
    let gameCastling = 0;

    for (let { move } of game) {
      currentGameStats[move.uas].numMoves++;

      // Check if the move is a castling move, if so we need to increment rook too
      if (move.flags === 'k' || move.flags === 'q') {
        let movingRook = move.flags === 'k' ? 'rh' : 'ra';
        if (move.color === 'w') {
          movingRook = movingRook.toUpperCase();
        }

        gameCastling++; // count that the game has castling

        // update castling counts depending on black/white queen/king side castling
        if (move.flags === 'k') {
          if (move.color === 'b') {
            this.castlingCounts.blackKing++;
          } else if (move.color === 'w') {
            this.castlingCounts.whiteKing++;
          }
        }
        if (move.flags === 'q') {
          if (move.color === 'b') {
            this.castlingCounts.blackQueen++;
          } else if (move.color === 'w') {
            this.castlingCounts.whiteQueen++;
          }
        }
        currentGameStats[movingRook].numMoves++;
      }
    }

    const gameLink = metadata
      .find((item) => item.startsWith('[Site "'))
      ?.replace('[Site "', '')
      ?.replace('"]', '');

    // Calculate single game maxes & add to global totals
    for (const uas of Object.keys(currentGameStats)) {
      // increment global totals
      this.totalMovesByPiece[uas].numMoves += currentGameStats[uas].numMoves;
      thisGameNumMoves += currentGameStats[uas].numMoves;

      if (currentGameStats[uas].numMoves > this.uasSingleGameMaxMoves) {
        this.uasSingleGameMaxMoves = currentGameStats[uas].numMoves;
        this.uasWithMostMoves = [uas as UASymbol]; // New highest moves, reset the array
        this.gamesWithUasMostMoves = [gameLink]; // New highest moves, reset the array
      } else if (currentGameStats[uas] === this.uasSingleGameMaxMoves) {
        this.uasWithMostMoves.push(uas as UASymbol); // Tie, add to the array
        this.gamesWithUasMostMoves.push(gameLink);
      }
    }

    if ((gameCastling = 0)) {
      this.gamesWithNoCastling++;
    }

    this.gamesProcessed++;
  }

  aggregate() {
    const averagesMap = createUAPMap({ avgMoves: 0 });
    // Calculate averages
    for (const uas of Object.keys(this.totalMovesByPiece)) {
      averagesMap[uas].avgMoves =
        this.totalMovesByPiece[uas].numMoves / this.gamesProcessed;
    }

    // identify piece with highest average number of moves
    for (const uas of Object.keys(averagesMap)) {
      if (averagesMap[uas].avgMoves > this.highestAverageMoves) {
        this.highestAverageMoves = averagesMap[uas].avgMoves;
        this.pieceHighestAverageMoves = [uas as UASymbol];
      } else if (averagesMap[uas].avgMoves === this.highestAverageMoves) {
        this.pieceHighestAverageMoves.push(uas as UASymbol); // if multiple pieces with same highestAverageMoves
      }
    }

    this.averagesMap = averagesMap;

    return {
      totalMovesByPiece: this.totalMovesByPiece,
      averageNumMovesPerGameByPiece: averagesMap,
      pieceHighestAverageMoves: this.pieceHighestAverageMoves,
      highestAverageMoves: this.highestAverageMoves,
      uasWithMostMovesSingleGame: this.uasWithMostMoves,
      uasSingleGameMaxMoves: this.uasSingleGameMaxMoves,
      gamesWithUasMostMoves: this.gamesWithUasMostMoves,
      gamesWithNoCastling: this.gamesWithNoCastling,
      queenKingCastlingCounts: this.castlingCounts,
      averagesMap,
    };
  }
}

export class MiscMoveFactMetric implements Metric {
  enPassantMoves: number;
  knightHops: UAPMap<{ count: number }>; // the number of times a piece is hopped over by knights
  totalNumKnightHops: number;

  constructor() {
    this.clear();
  }

  clear(): void {
    this.enPassantMoves = 0;
    this.knightHops = createUAPMap({ count: 0 });
    this.totalNumKnightHops = 0;
  }

  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata?: string[]
  ) {
    // since a knight can take 2 paths to hop over a piece we ensure that it is forced to hop over at least one piece.
    // When it must hop we assume it hops all pieces so that the result is deterministic
    for (const { move, board } of game) {
      if (move.flags === 'e') {
        this.enPassantMoves++;
      }

      if (move.piece === 'n') {
        // a knight moving in a given direction has 4 things it can do in context of board index. It can increase by 1, decrease by 1, increase by 16, or decrease by 16.
        // Right and down both increase total value, left and up decrease total value
        // But it must do one of those things 2x. Meaning possible differences are 31, 33, 14, 18, -31, -33, -14, -18 (absolute values)
        const moveDiff = move.toIndex - move.fromIndex;

        // The offsets from current index to check for pieces hopped
        let path1 = [];
        let path2 = [];
        switch (moveDiff) {
          case 33:
            path1 = [1, 17];
            path2 = [16, 32];
            break;
          case 31:
            path1 = [-1, 15];
            path2 = [16, 32];
            break;
          case 18:
            path1 = [1, 2];
            path2 = [16, 17];
            break;
          case 14:
            path1 = [-1, -2];
            path2 = [16, 15];
            break;
          case -14:
            path1 = [1, 2];
            path2 = [-16, -15];
            break;
          case -18:
            path1 = [-1, -2];
            path2 = [-16, -17];
            break;
          case -31:
            path1 = [1, -15];
            path2 = [-16, -32];
            break;
          case -33:
            path1 = [-1, -17];
            path2 = [-16, -32];
            break;
          default:
            throw new Error('unexpected moveDiff');
        }
        path1 = path1.map((offset) => move.fromIndex + offset);
        path2 = path2.map((offset) => move.fromIndex + offset);
        if (
          (!board[path1[0]] && !board[path1[1]]) ||
          (!board[path2[0]] && !board[path2[1]])
        ) {
          // if either path is clear we don't increment. Otherwise we randomly select a path to increment
          continue;
        } else {
          // Could choose one path or the other at random. This makes a non-deterministic results
          // const path = Math.random() > 0.5 ? path1[0] : path2[0];
          for (const squareIndex of path1.concat(path2)) {
            if (board[squareIndex]) {
              this.knightHops[board[squareIndex].uas].count++;
            }
          }
        }
      }
    }
  }

  aggregate() {
    let totalHops = 0;
    for (const uas of Object.keys(this.knightHops)) {
      totalHops += this.knightHops[uas].count;
    }
    this.totalNumKnightHops = totalHops;

    return {
      enPassantMovesCount: this.enPassantMoves,
      totalNumPiecesKnightHopped: totalHops,
    };
  }

  logResults(): void {
    console.log(`Number of enPassant moves: ${this.enPassantMoves}`);
    console.log(
      `Number of pieces knights hopped over: ${this.totalNumKnightHops}`
    );
  }
}
