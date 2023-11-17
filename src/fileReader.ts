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
    } else if (!line) {
      // empty line, do nothing
    } else if (line.startsWith('1.')) {
      // ensure that gameChunks only yields a value when both metadata and moves are not empty to prevent getting "undefined" in src/index.ts.
      if (metadata.length > 0 && line.trim() !== '') {
        yield {
          metadata,
          moves: line,
        };
      }
      metadata = [];
    } else {
      // AFAIK this should never happen
      console.log(`Unknown line: ${line}`);
      throw new Error(`Unknown line: ${line}`);
    }
  }
}
