import {
  Pawns,
  Piece,
  PrettyMove,
  PromotablePiece,
} from '../../cjsmin/src/chess';
import { Metric } from './metric';

export class PromotionMetric implements Metric {
  //uas pawns mapped to count of promotions to each piece type
  //prettier-ignore
  promotionMap: {
    [key in Pawns]: {
      [key in PromotablePiece]: number;
      }
  };
  // property for the totals
  totals: { [key in PromotablePiece]: number };
  movesAndGamesWithMaxQueenCount = [];
  maxQueenCounts = 2;


  constructor() {
    this.clear();
  }

  clear(): void {
    let promotionMap = {};

    //prettier-ignore
    for (const pawn of ["pa", "pb", "pc", "pd", "pe", "pf", "pg", "ph", 'PA', 'PB', 'PC', 'PD', 'PE', 'PF', 'PG', 'PH']) {
      promotionMap[pawn] = { q: 0, r: 0, b: 0, n: 0 };
    }

    this.totals = { q: 0, r: 0, b: 0, n: 0 };

    this.promotionMap = promotionMap as any;

    this.movesAndGamesWithMaxQueenCount = [];
  }

  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata?: string[]
  ) {

    // 2 queens to start with
    let thisGameQueenCount = 2;

    const gameSite = metadata.find((item) => item.startsWith('[Site "'))
    ?.replace('[Site "', '')
    ?.replace('"]', '');

    for (const { move } of game) {
      // TODO: we can use flags instead of includes('=)

      if (move.originalString.includes('=')) {
        // update maps
        this.promotionMap[move.uas][move.promotion]++;
        
        // increment queen count if a promotion occurs
        if (move.promotion === "q") {
          thisGameQueenCount++;
        }
      }

      // decrement queen count if queen is captured
      if (move.capture && (move.capture.uas === "q" || move.capture.uas === "Q")) {
        thisGameQueenCount--;
      }

      // identify the maxQueenCount in a particular move, and the games and moves that the maxQueenCount occured in
      // push to array of games and moves if tie, otherwise wipe the array and add new game
      // only add one move entry for each game maxQueenCount (rather than one entry for each move that the maxQueenCount appears in)
      if (thisGameQueenCount > this.maxQueenCounts) {
        this.maxQueenCounts = thisGameQueenCount;
        this.movesAndGamesWithMaxQueenCount = [{
          game: gameSite,
          move: move.originalString,
        }];
      } else if (thisGameQueenCount === this.maxQueenCounts) {
        if (!this.movesAndGamesWithMaxQueenCount.some((item) => item.game === gameSite)) {
          this.movesAndGamesWithMaxQueenCount.push({
            game: gameSite,
            move: move.originalString
          });
        }
      }
    }
  }

  aggregate() {
    this.totals = { q: 0, r: 0, b: 0, n: 0 };

    for (const pawn of Object.keys(this.promotionMap)) {
      for (const piece of Object.keys(this.promotionMap[pawn])) {
        this.totals[piece] += this.promotionMap[pawn][piece];
      }
    }

    return {
      promotedToTotals: this.totals,
      uasPromotingPieces: this.promotionMap,
      maxNumQueens: this.maxQueenCounts,
      movesAndGamesWithMaxQueenCount: this.movesAndGamesWithMaxQueenCount,
    }
  }

  logResults(): void {
    // promotions facts
    console.log('PROMOTIONS FACTS:');
    console.log(
      'How often a piece is promoted to different ambiguous piece types:'
    ),
      console.table(this.totals);
    console.log('How often each unambiguous piece is promoted:'),
      console.table(this.promotionMap);
    console.log(
      '=============================================================='
    );
    console.log('\n');

    // number of pieces to appear on board facts
    console.log("NUMBER OF PIECES TO APPEAR ON BOARD FACTS:")
    console.log(`The maximum number of queens to appear in a given move in a game: ${this.maxQueenCounts}`);
    console.log(`The games(s) and first move(s) in that game in which that number of queens appeared: 
      ${this.movesAndGamesWithMaxQueenCount.map(move => 
        JSON.stringify(move, null, 2)).join(", ")}`
    );
    console.log("==============================================================");
    console.log("\n");
  }
}
