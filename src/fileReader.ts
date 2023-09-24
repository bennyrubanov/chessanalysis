import { Chess } from 'chess.js';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

// Some scratch code to test the chess.js library
const board = new Chess(
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
);
console.log(board.ascii());
const a = board.get('e2');
console.log(a);

// this should yield/stream a single game at a time
export async function* gameChunks(path: string) {
  const fileStream = createReadStream(path);
  const reader = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  //   let i = 3000; // Debug code to limit the number of lines read
  let game = [];
  for await (const line of reader) {
    // metadata & move lines chunked as a single game
    if (line.startsWith('[')) {
      game.push(line);
    } else if (!line) {
      // empty line, do nothing
    } else if (line.startsWith('1.')) {
      // move line, yield the game
      game.push(line);
      yield game;
      game = [];
    } else {
      // AFAIK this should never happen
      console.log(`Unknown line: ${line}`);
      throw new Error(`Unknown line: ${line}`);
    }

    // console.log(`${line}`);
    // i--;
    // if (i === 0) {
    //   break;
    // }
  }
}

// Demo the generator
gameChunks('data/lichess_db_standard_rated_2013-01.pgn')
  .next()
  .then((x) => {
    console.log(x);
  });

gameChunks('data/lichess_db_standard_rated_2013-01.pgn')
  .next()
  .then((x) => {
    console.log(x);
  });
