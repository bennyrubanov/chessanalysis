export interface OpeningsRoot {
  san: string;
}

export interface Openings {
  san: string;
  count: number;
  children: Openings[];
}

export interface Moves {
  // the format of these is something like 'e2-e4'
  a2: string;
  a7: string;
  b2: string;
  b7: string;
  c2: string;
  c7: string;
  d2: string;
  d7: string;
  e2: string;
  e7: string;
  f2: string;
  f7: string;
  g2: string;
  g7: string;
  h7: string;
  Nb1: string;
  Nb8: string;
  Ng1: string;
  Ng8: string;
  Bc1: string;
  Bc8: string;
  Bf1: string;
  Bf8: string;
  Ra1: string;
  Ra8: string;
  Rh1: string;
  Rh8: string;
  Qd1: string;
  Qd8: string;
  Ke1: string;
  Ke8: string;
  h2: string;
}

export interface Heatmaps {
  squareUtilization: SquareUtilization[];
  moveSquares: SquareUtilization[];
  captureSquares: SquareUtilization[];
  checkSquares: SquareUtilization[];
}

interface SquareUtilization {
  p: ColorUse;
  n: ColorUse;
  b: ColorUse;
  r: ColorUse;
  q: ColorUse;
  k: ColorUse;
  all: ColorUse;
}

interface ColorUse {
  w: number;
  b: number;
}
