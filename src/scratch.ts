import { getMoveDistance } from './metrics';

async function main() {
  try {
    const result = await getMoveDistance('data/lichess_db_standard_rated_2013-01_TEST_SET.txt');
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

main().then(() => {});
