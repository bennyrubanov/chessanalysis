import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { FileReaderGame } from './types';

// this should yield/stream a single game at a time as long as the game is complete
export async function* gameChunks(
  path: string
): AsyncGenerator<FileReaderGame> {
  const fileStream = createReadStream(path);
  const reader = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let metadata: string[] = [];
  let moves: string = '';
  let ignoreGame: boolean = false;
  for await (const line of reader) {
    if (line.startsWith('[Event')) {
      // Start of a new game
      ignoreGame = false;
      metadata = [line];
    } else if (line.startsWith('[')) {
      if (!ignoreGame) {
        metadata.push(line);
      }
    } else if (line.startsWith('1.')) {
      if (!ignoreGame) {
        moves = line;
        // Check if the moves line contains the game result
        if (moves.includes('1-0') || moves.includes('0-1') || moves.includes('1/2-1/2')) {
          // Check if both the metadata and moves are not empty before yielding the game
          if (metadata.length > 0 && moves.trim() !== '') {
            yield {
              metadata,
              moves,
            };
          }
          // Reset metadata, moves, and ignoreGame for the next game
          metadata = [];
          moves = '';
          ignoreGame = false;
        }
      }
    } else if (line.trim() === '') {
      // Empty line, do nothing
    } else {
      // Unknown line, ignore the current game
      console.log(`Unknown line: ${line}`);
      ignoreGame = true;
      // Clear the metadata for the current game so that the game is not yielded
      metadata = [];
    }
  }
}
