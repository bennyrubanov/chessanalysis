import { Chess } from '../cjsmin/src/chess';

const chess = new Chess();

console.log(chess._board);
require('fs').writeFileSync('board.json', JSON.stringify(chess._board));

