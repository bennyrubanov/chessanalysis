import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { FileReaderGame } from './types';

// this should yield/stream a single game at a time
export async function* gameChunks(
  path: string
): AsyncGenerator<FileReaderGame> {
  const fileStream = createReadStream(path);
  const reader = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let metadata: string[] = [];
  for await (const line of reader) {
    // metadata & move lines chunked as a single game
    if (line.startsWith('[')) {
      metadata.push(line);
    } else if (line === '0-1' || line === '1-0' || line === '1/2-1/2') {
      // game result line, ignore and reset metadata
      metadata = [];
    } else if (!line) {
      // empty line, do nothing
    } else if (line.startsWith('1.')) {
      // move line, yield the game
      yield {
        metadata,
        moves: line,
      };
      metadata = [];
    } else {
      // AFAIK this should never happen
      console.log(`Unknown line: ${line}`);
      throw new Error(`Unknown line: ${line}`);
    }
  }
}
