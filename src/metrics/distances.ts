import { Piece, PrettyMove, UASymbol } from '../../cjsmin/src/chess';
import { UAPMap } from '../types';
import { createUAPMap } from '../utils';
import { Metric } from './metric';

export class MoveDistanceMetric implements Metric {
  distanceMap: UAPMap<{ 
    distance: number;
  }>;
  avgDistanceMap: UAPMap<{ 
    avgDistance: number;
  }>;
  pieceWithHighestAvg: UASymbol;
  pieceWithLowestAvg: UASymbol;
  maxAvgDistance: number;
  minAvgDistance: number;
  totalCollectiveDistance: number;
  // This has arrays to account for ties. Postions connect link to uas
  pieceMaxes: {
    distance: number;
    uasArray: UASymbol[];
    linkArray: string[];
  };
  gameCollectiveDistance: {
    distance: number;
    linkArray: string[];
  }
  gamesProcessed: number;

  constructor() {
    this.clear();
  }

  clear(): void {
    this.distanceMap = createUAPMap({
      distance: 0,
    });
    this.avgDistanceMap = createUAPMap({
      avgDistance: 0,
    });
    this.pieceWithHighestAvg = undefined;
    this.pieceWithLowestAvg = undefined;
    this.maxAvgDistance = 0;
    this.minAvgDistance = Infinity; // Set high so first will overwrite
    this.totalCollectiveDistance = 0;
    this.pieceMaxes = {
      distance: 0,
      uasArray: [],
      linkArray: [],
    };
    this.gameCollectiveDistance = {
      distance: 0,
      linkArray: [],
    };
    this.gamesProcessed = 0;
  }

  aggregate() {
    for (const uas of Object.keys(this.distanceMap)) {
      // increment the total collective distance by adding all pieces
      this.totalCollectiveDistance += this.distanceMap[uas].distance;

      const avgDistance = this.distanceMap[uas].distance / this.gamesProcessed;
      this.avgDistanceMap[uas].avgDistance = avgDistance;
      if (avgDistance > this.maxAvgDistance) {
        this.maxAvgDistance = avgDistance;
        this.pieceWithHighestAvg = uas as UASymbol;
      }
      if (avgDistance < this.minAvgDistance) {
        this.minAvgDistance = avgDistance;
        this.pieceWithLowestAvg = uas as UASymbol;
      }
    }

    return {
      pieceWithHighestAvg: this.pieceWithHighestAvg,
      maxAvgDistance: this.maxAvgDistance,
      pieceWithLowestAvg: this.pieceWithLowestAvg,
      minAvgDistance: this.minAvgDistance,
      pieceThatMovedTheFurthest: this.pieceMaxes.uasArray,
      gameInWhichPieceMovedTheFurthest: this.pieceMaxes.linkArray,
      distanceThatPieceMovedInTheGame: this.pieceMaxes.distance,
      totalCollectiveDistance: this.totalCollectiveDistance,
      gameMaxCollectiveDistance: this.gameCollectiveDistance,
      totalDistancesByPiece: this.distanceMap,
      avgDistancesByPiece: this.avgDistanceMap,
    }
  }

  logResults(): void {

    // distance facts
    console.log('DISTANCE FACTS:');
    console.log(
      `Piece with highest avg distance for games analyzed: ${this.pieceWithHighestAvg}`
    );
    console.log(
      `That piece's (${this.pieceWithHighestAvg}'s) average distance moved per game: ${this.maxAvgDistance}`
    );

    console.log(`Piece that moved the furthest: ${this.pieceMaxes.uasArray}`);
    console.log(`Game in which that/those piece(s) (${this.pieceMaxes.uasArray}) moved the furthest: ${this.pieceMaxes.linkArray}`
    );
    console.log(
      `Distance that/those piece(s) moved in the game: ${this.pieceMaxes.distance}`
    );
    console.log(
      `Game(s) with the furthest collective distance moved: ${this.gameCollectiveDistance.linkArray}`
    );
    console.log(
      `Collective distance moved in that/those game(s): ${this.gameCollectiveDistance.distance}`
    );
  }

  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata: string[]
  ) {
    // Initialize variables to keep track of the maximum distance and the piece
    const singleGameMap = createUAPMap({ distance: 0 });

    for (const { move } of game) {
      // Check if the move is a castling move
      if (move.flags === 'k' || move.flags === 'q') {
        let movingKing = 'k';
        let movingRook, rookDistance;

        if (move.flags === 'k') {
          rookDistance = 2;
          movingRook = 'rh';
        } else {
          rookDistance = 3;
          movingRook = 'ra';
        }

        if (move.color === 'w') {
          movingRook = movingRook.toUpperCase();
          movingKing = movingKing.toUpperCase();
        }

        // 2 for king + rook distance
        singleGameMap[movingKing].distance += 2;
        singleGameMap[movingRook].distance += rookDistance;
      } else {
        // Calculate the file (column) distance by subtracting ASCII values
        const fileDist = Math.abs(
          move.from.charCodeAt(0) - move.to.charCodeAt(0)
        );
        // Calculate the rank (row) distance by subtracting numeric values
        const rankDist = Math.abs(Number(move.from[1]) - Number(move.to[1]));
        // The distance moved is the maximum of fileDist and rankDist
        const distance = Math.max(fileDist, rankDist);

        singleGameMap[move.uas].distance += distance;
      }
    }

    const gameLink = metadata.find((item) => item.startsWith('[Site "'))
    ?.replace('[Site "', '')
    ?.replace('"]', '');
    let singleGameCollective = 0;

    // add the single game aggregates to the state object
    for (const uas of Object.keys(singleGameMap)) {
      this.distanceMap[uas].distance += singleGameMap[uas].distance; // aggregate total distances moved by each piece across games
      singleGameCollective += singleGameMap[uas].distance; // aggregate the total collective distance moved in a game

      // find the max distance moved by a piece in a single game
      if (singleGameMap[uas].distance > this.pieceMaxes.distance) {
        this.pieceMaxes.uasArray = [uas as UASymbol];
        this.pieceMaxes.distance = singleGameMap[uas].distance;
        this.pieceMaxes.linkArray = [gameLink];
      } else if (singleGameMap[uas].distance === this.pieceMaxes.distance) {
        this.pieceMaxes.uasArray.push(uas as UASymbol);
        this.pieceMaxes.linkArray.push(gameLink);
      }
    }

    // find the game in which the most collective distance was moved
    if (
      singleGameCollective > this.gameCollectiveDistance.distance
    ) {
      this.gameCollectiveDistance.distance = singleGameCollective;
      this.gameCollectiveDistance.linkArray = [gameLink];
    } else if (singleGameCollective === this.gameCollectiveDistance.distance
    ) {
      this.gameCollectiveDistance.linkArray.push(gameLink);
    }

    this.gamesProcessed++;
  }
}
