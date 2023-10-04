import { Chess } from '../cjsmin/src/chess';
import { gameChunks } from './fileReader';
import { getGameHistory, initializeMetricMaps } from './prepare';

export async function main() {
  const year = 2013;
  const month = '01';
  // const path = `data/lichess_db_standard_rated_${year}-${month}.pgn`;
  const path = `data/short.pgn`;
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
        //@ts-ignore
        metrics[move.to].deaths[move.captured]++;
        //@ts-ignore
        metrics[move.from].kills[move.captured]++;
      }
    }
    histories.push(history);
  }

  // const tmp = JSON.parse(require('fs').readFileSync('histories.json'));
  // console.log(tmp);
  // const tmp2: any[] = tmp.map((game: any) => {
  //   return game.map((x: any) => {
  //     return {
  //       color: x.color,
  //       captured: x.captured,
  //       from: x.from,
  //       to: x.to,
  //       flags: x.flags,
  //       piece: x.piece,
  //       promotion: x.promotion,
  //     };
  //   });
  // });

  // require('fs').writeFileSync(
  //   'historiesShort.json',
  //   JSON.stringify(tmp2, null, 2)
  // );

  if (
    require('fs').readFileSync('historiesShort.json') ==
    JSON.stringify(histories, null, 2)
  ) {
    console.log('histories match');
    return true;
  } else {
    console.log('histories do not match');
    require('fs').writeFileSync(
      'badhistory.json',
      JSON.stringify(histories, null, 2)
    );
    return false;
  }
}

// import { Chess } from 'chess.js';

// const b = new Chess();
// b.reset();
// console.log(b._board);
// require('fs').writeFileSync('test.json', JSON.stringify(b._board, null, 2));
