import { ALL_SQUARES, Piece, PrettyMove, UASymbol } from "../cjsmin/chess";
import { BoardAndPieceMap, UAPMap } from "../types";
import { createBoardAndPieceMap, createBoardMap, createUAPMap } from "../utils";
import { Metric } from "./metric";

export class KillStreakMetric implements Metric {
  killStreakMap: {
    [key: string]: {
      killStreaks: number;
    };
  };
  maxKillStreakGame: string[];
  maxKillStreak: number;
  maxKillStreakPiece: UASymbol[];

  constructor() {
    this.killStreakMap = createUAPMap({ killStreaks: 0 });
    this.maxKillStreakGame = [];
    this.maxKillStreak = 0;
    this.maxKillStreakPiece = [];
  }

  clear(): void {
    this.killStreakMap = createUAPMap({ killStreaks: 0 });
    this.maxKillStreakGame = [];
    this.maxKillStreak = 0;
    this.maxKillStreakPiece = [];
  }

  aggregate() {
    return {
      killStreakMap: this.killStreakMap,
      maxKillStreak: this.maxKillStreak,
      maxKillStreakPiece: this.maxKillStreakPiece,
      maxKillStreakGame: this.maxKillStreakGame,
    };
  }

  logResults(): void {
    console.log("Kill streak map", this.killStreakMap);
    console.log(`Max Kill Streak: ${this.maxKillStreak}`);
    console.log(`Max Kill Streak Piece: ${this.maxKillStreakPiece}`);
    console.log(`Game(s) with max kill streak(s): ${this.maxKillStreakGame}`);
  }

  getMaxKillStreak(
    game: { move: PrettyMove; board: Piece[] }[],
    startingIndex: 0 | 1, // assume games have at least 2 moves
    gameLink: string
  ) {
    let i = startingIndex;
    let streakLength = 0;
    let streakPiece: UASymbol;

    while (i < game.length) {
      const move = game[i].move;
      // if the move is a capture or a mate, it counts towards kill streaks
      if (move.capture || move.originalString.includes("#")) {
        // streak has been reset because new piece captures
        if (streakLength === 0) {
          streakPiece = move.uas;
          streakLength++;
          // same piece captures again
        } else if (streakPiece === move.uas) {
          streakLength++;

          // streak is not 0 but different piece captures, so
          // take the previous kill streak piece and update its max kill streak
        } else {
          this.killStreakMap[streakPiece].killStreaks = Math.max(
            this.killStreakMap[streakPiece].killStreaks,
            streakLength
          );
          this.checkMaxes(streakPiece, gameLink, streakLength);

          streakLength = 0; // reset streak
        }
      }
      i += 2;
    }

    if (streakPiece) {
      // handle edge case where the game ends with a capture streak by the same piece
      this.killStreakMap[streakPiece].killStreaks = Math.max(
        this.killStreakMap[streakPiece].killStreaks,
        streakLength
      );
      this.checkMaxes(streakPiece, gameLink, streakLength);
    }
  }

  checkMaxes(streakPiece: UASymbol, gameLink: string, streakLength: number) {
    // update maxes
    if (streakLength > this.maxKillStreak) {
      this.maxKillStreak = streakLength;
      this.maxKillStreakPiece = [streakPiece as UASymbol];
      this.maxKillStreakGame = [gameLink];
    } else if (streakLength === this.maxKillStreak) {
      this.maxKillStreakPiece.push(streakPiece as UASymbol);
      this.maxKillStreakGame.push(gameLink);
    }
  }

  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata?: string[]
  ) {
    const gameLink = metadata
      .find((item) => item.startsWith('[Site "'))
      ?.replace('[Site "', "")
      ?.replace('"]', "");

    this.getMaxKillStreak(game, 0, gameLink);
    this.getMaxKillStreak(game, 1, gameLink);
  }
}

export class KDRatioMetric implements Metric {
  // create an object to track kills and deaths of each piece
  // The KDMap is an object where each key is a piece and the value is another object with kills and deaths properties.
  KDMap: UAPMap<{
    kills: number;
    deaths: number;
    revengeKills: number;
  }>;
  pieceWithHighestKDRatio: UASymbol[];
  // KDRatios is a convenience object for aggregation
  kdRatios: UAPMap<number>;

  KDValuesMap: UAPMap<{
    valueKills: number;
    deaths: number;
  }>;
  pieceWithHighestKDRatioValues: UASymbol[];
  kdRatiosValues: UAPMap<number>;

  constructor() {
    this.clear();
  }

  logResults(): void {
    // KDR facts
    console.log("KDR FACTS (INCLUDING CHECKMATES AS KILLS):");
    console.log(
      `Piece with the highest KD ratio: ${this.pieceWithHighestKDRatio}`
    );
    console.log(
      "Kills, deaths, and revenge kills  for each unambiguous piece:"
    ),
      console.table(this.KDMap);
    console.log(
      "Kill Death Ratios for each unambiguous piece: " +
        JSON.stringify(this.kdRatios, null, 2)
    );
    console.log("\n");
    console.log(
      "KDRs TAKING INTO ACCOUNT PIECE VALUES (Pawn 1 point, Knight 3 points, Bishop 3 points, Rook 5 points, Queen 9 points, King 4 points): "
    );
    console.log(
      `Piece with the highest KD ratio (taking into account piece values): ${this.pieceWithHighestKDRatioValues}`
    );
    console.log(
      "Kills, Deaths, and for each unambiguous piece (taking into account piece values):"
    ),
      console.table(this.KDValuesMap);
    console.log(
      "Kill Death Ratios for each unambiguous piece (taking into account piece values): " +
        JSON.stringify(this.kdRatiosValues, null, 2)
    );
  }

  aggregate() {
    const KDRatios = createUAPMap(0);
    const KDRatiosValues = createUAPMap(0);

    // calculate the KD ratios of each piece
    for (const uas of Object.keys(this.KDMap)) {
      const kills = this.KDMap[uas].kills;
      const deaths = this.KDMap[uas].deaths || 0;
      if (deaths !== 0) {
        KDRatios[uas] = kills / deaths;
      }
    }

    // calculate the KD ratios of each piece depending on piece value
    for (const uas of Object.keys(this.KDValuesMap)) {
      const valueKills = this.KDValuesMap[uas].valueKills;
      const deaths = this.KDValuesMap[uas].deaths || 0;
      if (deaths !== 0) {
        KDRatiosValues[uas] = valueKills / deaths;
      }
    }

    // find the piece with the highest KD ratio
    let maxKDRatio = 0;
    let pieceWithHighestKDRatio: UASymbol[] = [];

    for (const uas of Object.keys(KDRatios)) {
      if (KDRatios[uas] > maxKDRatio) {
        maxKDRatio = KDRatios[uas];
        pieceWithHighestKDRatio = [uas as UASymbol];
      } else if (KDRatios[uas] === maxKDRatio) {
        pieceWithHighestKDRatio.push(uas as UASymbol); // tie, add to the array
      }
    }

    this.kdRatios = KDRatios;
    this.pieceWithHighestKDRatio = pieceWithHighestKDRatio;

    // repeat for the KDRatios taking into account piece values
    let maxKDRatioValues = 0;
    let pieceWithHighestKDRatioValues: UASymbol[] = [];

    for (const uas of Object.keys(KDRatiosValues)) {
      if (KDRatiosValues[uas] > maxKDRatioValues) {
        maxKDRatioValues = KDRatiosValues[uas];
        pieceWithHighestKDRatioValues = [uas as UASymbol];
      } else if (KDRatiosValues[uas] === maxKDRatio) {
        pieceWithHighestKDRatioValues.push(uas as UASymbol); // tie, add to the array
      }
    }

    this.kdRatiosValues = KDRatiosValues;
    this.pieceWithHighestKDRatioValues = pieceWithHighestKDRatioValues;

    return {
      maxKDRatio,
      pieceWithHighestKDRatio,
      KDRatios: KDRatios,
      KDRatiosValues,
      pieceWithHighestKDRatioValues,
      KDValuesMap: this.KDValuesMap,
      KDMap: this.KDMap,
    };
  }

  clear(): void {
    // KDRatios is reset JIT since it is only used in aggregation
    this.KDMap = createUAPMap({
      kills: 0,
      deaths: 0,
      revengeKills: 0,
    });
    this.kdRatios = undefined;
    this.KDValuesMap = createUAPMap({
      valueKills: 0,
      deaths: 0,
    });
    this.kdRatiosValues = undefined;
  }

  // calculates piece with highest K/D ratio and also contains  by that piece
  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata?: string[]
  ) {
    // @ts-ignore initialize with no capture
    let previousMove: PrettyMove = {};
    for (const { move } of game) {
      if (move.capture) {
        this.KDMap[move.uas].kills++;
        this.KDMap[move.capture.uas].deaths++;

        this.KDValuesMap[move.capture.uas].deaths++;

        // identify kill values based on captured piece type
        if (move.capture.type === "p") {
          this.KDValuesMap[move.uas].valueKills++;
        } else if (move.capture.type === "n" || move.capture.type === "b") {
          this.KDValuesMap[move.uas].valueKills += 3;
        } else if (move.capture.type === "k") {
          this.KDValuesMap[move.uas].valueKills += 4; // king's fighting value valued around 4 points in https://en.wikipedia.org/wiki/Chess_piece_relative_value
        } else if (move.capture.type === "r") {
          this.KDValuesMap[move.uas].valueKills += 5;
        } else if (move.capture.type === "q") {
          this.KDValuesMap[move.uas].valueKills += 9;
        }

        // identify a revenge kill if the previous move and the current move contained a capture, and the square moved to in the previous move is the same as the square moved to in this move
        if (previousMove.capture && move.to === previousMove.to) {
          this.KDMap[move.uas].revengeKills++;
        }
        previousMove = move;
      }
    }

    const lastMove = game[game.length - 1].move;
    // Check if the game is in checkmate after the last move
    if (lastMove.originalString.includes("#")) {
      const unambigMatingPiece = lastMove.uas;
      this.KDMap[unambigMatingPiece].kills++;
      this.KDValuesMap[unambigMatingPiece].valueKills++; // king kill counts as 1 point

      // only kings can get mated, and we know whose move it is
      const matedKing = lastMove.color === "w" ? "k" : "K";
      this.KDMap[matedKing].deaths++;
      this.KDValuesMap[matedKing].deaths++;

      // A revenge kill can occur by checkmate too
      const secondToLastMove = game[game.length - 2].move;
      if (secondToLastMove.capture && secondToLastMove.uas === matedKing) {
        this.KDMap[lastMove.uas].revengeKills++;
      }
    }
  }
}

export class MateAndAssistMetric implements Metric {
  mateAndAssistMap: UAPMap<{
    mates: number;
    assists: number;
    hockeyAssists: number;
  }>;
  matedCounts: {
    k: number;
    K: number;
  };

  // these are initialized as undefined
  constructor() {
    this.clear();
  }

  // TODO: maybe slightly better if we don't recreate when clearing
  clear(): void {
    this.mateAndAssistMap = createUAPMap({
      mates: 0,
      assists: 0,
      hockeyAssists: 0,
    });

    // We delete kings because they cannot deliver checks and can only be mated
    // delete this.mateAndAssistMap.k;
    // delete this.mateAndAssistMap.K;
    this.matedCounts = {
      k: 0,
      K: 0,
    };
  }

  aggregate() {
    return {
      mateAndAssistMap: this.mateAndAssistMap,
      matedCounts: this.matedCounts,
    };
  }

  logResults() {}

  // One edge case currently unaccounted for is when pieces "share" a mate, or check. This can be at most 2 due to discovery
  // checks (currently we disregard this by just saying the last piece to move is the "mating piece")
  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata?: string[]
  ) {
    // Take no action if the game didn't end in checkmate
    if (!game[game.length - 1].move.originalString.includes("#")) {
      return;
    }

    const lastMove = game[game.length - 1].move;

    // increment the mate count of the mating piece
    this.mateAndAssistMap[lastMove.uas].mates++;
    if (lastMove.uas === "k" || lastMove.uas === "K") {
      console.log(
        `code identified a king as having a mate (caused by discovered check). move: ${lastMove.originalString}`
      );
      const gameLink = metadata
        .find((item) => item.startsWith('[Site "'))
        ?.replace('[Site "', "")
        ?.replace('"]', "");
      console.log(`game: ${gameLink}`);
    }

    // increment the mated (death) count of the mated king
    this.matedCounts[lastMove.color === "w" ? "k" : "K"]++;

    // The fastest possible checkmate is in 2 moves, so we do have to check for out of bounds

    // Look back 2 moves to see if there was an assist
    if (game.length > 2) {
      const assistMove = game[game.length - 3].move;
      if (
        assistMove.originalString.includes("+") &&
        assistMove.uas !== lastMove.uas
      ) {
        this.mateAndAssistMap[assistMove.uas].assists++;
      }

      // hockey assist is only counted if there was also an assist
      if (game.length > 4) {
        const hockeyAssistMove = game[game.length - 5].move;
        if (
          hockeyAssistMove.originalString.includes("+") &&
          assistMove.uas !== lastMove.uas
        ) {
          this.mateAndAssistMap[hockeyAssistMove.uas].hockeyAssists++;
        }
      }
    }
  }
}

export class CaptureLocationMetric implements Metric {
  captureLocationMap: BoardAndPieceMap<{ captures: number; captured: number }>;

  constructor() {
    this.clear();
  }

  clear(): void {
    const newMap = {};
    for (const square of ALL_SQUARES) {
      newMap[square] = createUAPMap({ captures: 0, captured: 0 });
    }
    this.captureLocationMap = newMap as any;
  }

  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata?: string[]
  ) {
    let lastMove: PrettyMove;
    for (const { move, board } of game) {
      if (move.capture) {
        this.captureLocationMap[move.to][move.uas].captures++;
        this.captureLocationMap[move.to][move.capture.uas].captured++;
      }
      lastMove = move;
    }
  }

  aggregate() {
    // Gets a capture total for each square
    const captureTotals = createBoardMap({ captures: 0, captured: 0 });
    for (const square of Object.keys(this.captureLocationMap)) {
      for (const uas of Object.keys(this.captureLocationMap[square])) {
        captureTotals[square].captures +=
          this.captureLocationMap[square][uas].captures;
        captureTotals[square].captured +=
          this.captureLocationMap[square][uas].captured;
      }
    }

    return captureTotals;
  }
}

export class MatingSquareMetric implements Metric {
  matingSquareMap: BoardAndPieceMap<{
    mates: number;
  }>;

  // these are initialized as undefined
  constructor() {
    this.clear();
  }

  // TODO: maybe slightly better if we don't recreate when clearing
  clear(): void {
    this.matingSquareMap = createBoardAndPieceMap({
      mates: 0,
    });
  }

  aggregate() {
    // Gets a mate total for each square
    const mateTotals = createUAPMap({ captures: 0, captured: 0 });
    for (const square of Object.keys(this.matingSquareMap)) {
      for (const uas of Object.keys(this.matingSquareMap[square])) {
        mateTotals[square] += this.matingSquareMap[square][uas].mates;
      }
    }
    return mateTotals;
  }

  // One edge case currently unaccounted for is when pieces "share" a mate, or check. This can be at most 2 due to discovery
  // checks (currently we disregard this by just saying the last piece to move is the "mating piece")
  processGame(game: { move: PrettyMove; board: Piece[] }[]) {
    // Take no action if the game didn't end in checkmate
    if (!game[game.length - 1].move.originalString.includes("#")) {
      return;
    }

    const lastMove = game[game.length - 1].move;
    // TODO: this is not properly tracking which pieces are delivering mates or assists, because discovery checks can be delivered
    // by pieces other than the last piece to move
    this.matingSquareMap[lastMove.to][lastMove.uas].mates++;
  }
}

/**
 * When determining discovery checks, we need to look at the ray that was revealed. That means tracking the index of the king
 * and the index of the moving piece, tracing that line back and seeing if a piece is now threatening.
 * We also need to track the new piece and see if its movement has created a new threat ray
 */
