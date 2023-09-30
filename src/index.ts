import { gameChunks } from './fileReader';
import { initializeMetricMaps } from './prepare';

async function main() {
  const year = 2013;
  const month = '01';
  const path = `data/lichess_db_standard_rated_${year}-${month}.pgn`;
  const board = initializeMetricMaps();
  const games = gameChunks(path);

  let count = 0;
  for await (const game of games) {
    count++;
    console.log(count);
    // const history = getGameHistory(game.moves);
    // for (const move of history) {
    //   if (move.captured) {
    //     board[move.to].deaths[move.captured]++;
    //     board[move.from].kills[move.captured]++;
    //   }
    // }
  }

  console.log(board);
}

main().then(() => {});
