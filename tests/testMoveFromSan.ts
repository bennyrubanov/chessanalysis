import { Chess } from '../cjsmin/src/chess';

const chess = new Chess();
const move = 'O-O-O';
const result = chess.testMoveFromSan(move);

console.log(`Result of moveFromSan for move ${move}:`, result);