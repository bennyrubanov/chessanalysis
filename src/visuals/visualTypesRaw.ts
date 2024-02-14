export interface ChessVisualTypes {
  heatmaps: Heatmaps;
}

interface Heatmaps {
  squareUtilization: SquareUtilization[];
  moveSquares: SquareUtilization[];
  captureSquares: SquareUtilization[];
  checkSquares: SquareUtilization[];
}

export interface SquareUtilization {
  p: P;
  n: P;
  b: P;
  r: P;
  q: P;
  k: P;
  all: P;
}

interface P {
  w: number;
  b: number;
}
