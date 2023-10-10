import { createReadStream } from 'fs';
import { createInterface } from 'readline';

// this should yield/stream a single game at a time
export async function* gameChunks(path: string): AsyncGenerator<string[]> {
  const fileStream = createReadStream(path);
  const reader = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let game: string[] = [];
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
  }
}
