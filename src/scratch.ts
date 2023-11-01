import { countGamesInDataset } from '../src/metrics/metrics';
import * as path from 'path';

const filePath = path.resolve(__dirname, '../data/temp.pgn');

try {
  const result = countGamesInDataset(filePath);
  console.log(result);
} catch (error) {
  console.error(error);
}