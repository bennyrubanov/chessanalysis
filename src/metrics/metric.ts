import { Piece, PrettyMove } from '../cjsmin/src/chess';

export interface Metric {
  processGame(
    game: { move: PrettyMove; board: Piece[] }[],
    metadata?: string[]
  ): any;

  logResults?(): void;

  // Reset the maps used to track metrics
  clear?(): void;

  // Aggregate the results of the metric
  aggregate?(...args: any[]): any;
}
