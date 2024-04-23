import { Square, UASymbol } from './cjsmin/chess';

export interface FileReaderGame {
  moves: string;
  metadata?: string[];
}

export type UAPMap<T> = {
  [key in UASymbol]: T;
};

export type BoardAndPieceMap<T> = {
  [key in Square]: {
    [key in UASymbol]: T;
  };
};

export type BoardMap<T> = {
  [key in Square]: T;
};
