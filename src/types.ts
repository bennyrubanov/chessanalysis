import { Square, UAPSymbol } from '../cjsmin/src/chess';

export interface FileReaderGame {
  moves: string;
  metadata: string[];
}

export type UAPMap<T> = {
  [key in UAPSymbol]: T;
};

export type BoardMap = {
  [key in Square]: {
    [key in UAPSymbol]: {
      captured: number;
      captures: number;
      revengeKills: number;
    };
  };
};
