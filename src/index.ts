import { gameChunks } from './fileReader';

async function main() {
  const year = 2013;
  const month = '01';
  const path = `data/lichess_db_standard_rated_${year}-${month}.pgn`;
  await gameChunks(path);
}

console.log('Hello, world!');
main().then(() => {});
