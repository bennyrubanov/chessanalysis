import { Square, UASymbol } from '../cjsmin/src/chess';

export interface FileReaderGame {
  moves: string;
  metadata: string[];
}

export type UAPMap<T> = {
  [key in UASymbol]: T;
};

export type BoardMap = {
  [key in Square]: {
    [key in UASymbol]: {
      captured: number;
      captures: number;
      revengeKills: number;
    };
  };
};
