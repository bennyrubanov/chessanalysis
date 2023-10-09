import { Chess } from '../cjsmin/src/chess';
import { gameChunks } from './fileReader';
import { getGameHistory, initializeMetricMaps } from './prepare';

export async function main(path: string) {
  const year = 2013;
  const month = '01';
  // const path = `data/lichess_db_standard_rated_${year}-${month}_TEST_SET.pgn`;
  // const path = `data/short.pgn`;
  const metrics = initializeMetricMaps();
  const games = gameChunks(path);
  const board = new Chess();

  let count = 0;
  let histories = [];
  for await (const game of games) {
    count++;
    // console.log(count);
    const history = getGameHistory(board, game.moves);
    for (const move of history) {
      if (move.captured) {
        metrics[move.to].deaths[move.captured]++;
        metrics[move.from].kills[move.captured]++;
      }
    }
    histories.push(history);
  }

  const histShort = require('fs')
    .readFileSync('historiesShort.json')
    .toString()
    .trim();
  if (histShort == JSON.stringify(histories, null, 2).trim()) {
    console.log('histories match');
  } else {
    console.log('histories do not match');
    require('fs').writeFileSync(
      'badhistory.json',
      JSON.stringify(histories, null, 2)
    );
  }

  return {
    histShort,
    historiesString: JSON.stringify(histories, null, 2),
  };
}

// import { Chess } from 'chess.js';

// const b = new Chess();
// b.reset();
// console.log(b._board);
// require('fs').writeFileSync('test.json', JSON.stringify(b._board, null, 2));

if (require.main === module) {
  main(`data/short.pgn`).then((res) => {});
}
