import { Chess } from '../cjsmin/src/chess';

const chess = new Chess();

// console.log(chess._board);
// require('fs').writeFileSync('board.json', JSON.stringify(chess._board));

console.log(chess._castling.b);
console.log(chess._castling.w);
console.log(chess._turn);
console.log(chess._board);
