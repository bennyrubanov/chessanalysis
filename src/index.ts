import { gameChunks } from './fileReader';
import { getGameHistory, initializeMetricMaps } from './prepare';

async function main() {
  const year = 2013;
  const month = '01';
  const path = `data/lichess_db_standard_rated_${year}-${month}.pgn`;
  const board = initializeMetricMaps();
  const games = gameChunks(path);

  let count = 0;
  for await (const game of games) {
    count++;
    const history = getGameHistory(game.moves);
    for (const move of history) {
      if (move.captured) {
        board[move.to].deaths[move.captured]++;
        board[move.from].kills[move.captured]++;
      }
    }
  }

  require('fs').writeFileSync('test.json', JSON.stringify(board, null, 2));
  console.log(board);
}

main().then(() => {});

// import { Chess } from 'chess.js';

// const b = new Chess();
// b.reset();
// console.log(b._board);
// require('fs').writeFileSync('test.json', JSON.stringify(b._board, null, 2));
