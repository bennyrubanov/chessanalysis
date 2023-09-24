import { Chess } from 'chess.js';

interface GameHistory {
  before: string; // FEN notation of the board before the move
  after: string; // FEN notation of the board after the move
  color: string;
  piece: string;
  from: string;
  to: string;
  san: string; // Move notation type
  lan: string; // Move notation type (long)
  flags: string; // idk what this is
}

// TODO: if needed we can overwrite the history code to store only what we need https://github.com/jhlywa/chess.js/blob/master/README.md#history-options-
function getGameHistory(game: string[]) {
  // TODO: implement
}

// Should return an object for the metrics we want to track, not sure how best to structure so an exercise for the reader
function initializeMetricMaps() {
  // kd ratio, distances moved,
}

// take a start and end board position and return the distance moveds
function getMoveDistance(start: string, end: string) {}

// take a board and move and see if a capture occurred
function checkForCapture(board: Chess, move: string) {}
