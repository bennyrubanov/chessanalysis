import {
  Chess,
  Color,
  PieceSymbol,
  Square,
  UnambiguousPieceSymbols,
} from '../cjsmin/src/chess';

export interface FileReaderGame {
  moves: string;
  metadata: string[];
}

export type GameHistoryMove = {
  originalString: string;
  color: Color;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  flags: string;
};