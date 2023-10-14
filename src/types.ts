import { Color, PieceType, Square } from '../cjsmin/src/chess';

export interface FileReaderGame {
  moves: string;
  metadata: string[];
}

export interface GameHistoryMove {
  originalString: string;
  color: Color;
  from: Square;
  to: Square;
  piece: PieceType;
  captured?: PieceType;
  promotion?: PieceType;
  flags: string;
}

export interface Capture {
  captured: PieceType;
  capturedBy: PieceType;
  captureSquare: Square;
  originSquare: Square;
}
