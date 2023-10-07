import { Chess } from 'chess.js';
import { Square } from 'chess.js';
import { gameChunks } from './fileReader';

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


// Need to decide how we assign the openings to a game (and get a db of openings)
function checkOpening() {}

// Should return an object for the metrics we want to track, not sure how best to structure so an exercise for the reader
function initializeMetricMaps() {
  // kd ratio, distances moved,

  const squareInfo = {
    kills: {
      pawn: 0,
      knight: 0,
      bishop: 0,
      rook: 0,
      queen: 0,
      king: 0,
    },
    deaths: {
      pawn: 0,
      knight: 0,
      bishop: 0,
      rook: 0,
      queen: 0,
      king: 0,
    },
  };

  const chessboard: any = [];
  for (let i = 0; i < 8; i++) {
    const row: any = [];
    for (let j = 0; j < 8; j++) {
      // Determine the color of the square based on the row and column
      row.push({});
    }
    chessboard.push(row);
  }

  return {
    pawn: {},
    knight: {},
    bishop: {},
    rook: {},
    queen: {},
    king: {},
  };
}

// take a start and end board position and return the distances moved
export async function getMoveDistance(filePath: string) {
  for await (const game of gameChunks(filePath)) {
    try {
      const chess = new Chess(); // Create a new instance of the Chess class
      for (const line of game) {
        // Ignore header information
        if (!line.startsWith('[') && line.trim() !== '') {
          const moves = line.split(' ').filter(move => !move.endsWith('.') && !['1-0', '0-1', '1/2-1/2'].includes(move));
          for (const move of moves) {
            //console.log(`Processing move: ${move}`);
            chess.move(move);
          }
        }
      }

      const ingestedMoves = chess.history({ verbose: true })
      //console.log(ingestedMoves)
      
      const pieces: { [key: string]: { initialPosition: string; currentPosition: string; distanceMoved: number } } = {
        'wRa': {
          initialPosition: 'a1',
          currentPosition: 'a1',
          distanceMoved: 0,
        },
        'wNb': {
          initialPosition: 'b1',
          currentPosition: 'b1',
          distanceMoved: 0,
        },
        'wBc': {
          initialPosition: 'c1',
          currentPosition: 'c1',
          distanceMoved: 0,
        },
        'wQd': {
          initialPosition: 'd1',
          currentPosition: 'd1',
          distanceMoved: 0,
        },
        'wKe': {
          initialPosition: 'e1',
          currentPosition: 'e1',
          distanceMoved: 0,
        },
        'wBf': {
          initialPosition: 'f1',
          currentPosition: 'f1',
          distanceMoved: 0,
        },
        'wNg': {
          initialPosition: 'g1',
          currentPosition: 'g1',
          distanceMoved: 0,
        },
        'wRh': {
          initialPosition: 'h1',
          currentPosition: 'h1',
          distanceMoved: 0,
        },
        'wPa': {
          initialPosition: 'a2',
          currentPosition: 'a2',
          distanceMoved: 0,
        },
        'wPb': {
          initialPosition: 'b2',
          currentPosition: 'b2',
          distanceMoved: 0,
        },
        'wPc': {
          initialPosition: 'c2',
          currentPosition: 'c2',
          distanceMoved: 0,
        },
        'wPd': {
          initialPosition: 'd2',
          currentPosition: 'd2',
          distanceMoved: 0,
        },
        'wPe': {
          initialPosition: 'e2',
          currentPosition: 'e2',
          distanceMoved: 0,
        },
        'wPf': {
          initialPosition: 'f2',
          currentPosition: 'f2',
          distanceMoved: 0,
        },
        'wPg': {
          initialPosition: 'g2',
          currentPosition: 'g2',
          distanceMoved: 0,
        },
        'wPh': {
          initialPosition: 'h2',
          currentPosition: 'h2',
          distanceMoved: 0,
        },
        'bRa': {
          initialPosition: 'a8',
          currentPosition: 'a8',
          distanceMoved: 0,
        },
        'bNb': {
          initialPosition: 'b8',
          currentPosition: 'b8',
          distanceMoved: 0,
        },
        'bBc': {
          initialPosition: 'c8',
          currentPosition: 'c8',
          distanceMoved: 0,
        },
        'bQd': {
          initialPosition: 'd8',
          currentPosition: 'd8',
          distanceMoved: 0,
        },
        'bKe': {
          initialPosition: 'e8',
          currentPosition: 'e8',
          distanceMoved: 0,
        },
        'bBf': {
          initialPosition: 'f8',
          currentPosition: 'f8',
          distanceMoved: 0,
        },
        'bNg': {
          initialPosition: 'g8',
          currentPosition: 'g8',
          distanceMoved: 0,
        },
        'bRh': {
          initialPosition: 'h8',
          currentPosition: 'h8',
          distanceMoved: 0,
        },
        'bPa': {
          initialPosition: 'a7',
          currentPosition: 'a7',
          distanceMoved: 0,
        },
        'bPb': {
          initialPosition: 'b7',
          currentPosition: 'b7',
          distanceMoved: 0,
        },
        'bPc': {
          initialPosition: 'c7',
          currentPosition: 'c7',
          distanceMoved: 0,
        },
        'bPd': {
          initialPosition: 'd7',
          currentPosition: 'd7',
          distanceMoved: 0,
        },
        'bPe': {
          initialPosition: 'e7',
          currentPosition: 'e7',
          distanceMoved: 0,
        },
        'bPf': {
          initialPosition: 'f7',
          currentPosition: 'f7',
          distanceMoved: 0,
        },
        'bPg': {
          initialPosition: 'g7',
          currentPosition: 'g7',
          distanceMoved: 0,
        },
        'bPh': {
          initialPosition: 'h7',
          currentPosition: 'h7',
          distanceMoved: 0,
        },
      };

      // Initialize variables to keep track of the maximum distance and the piece
      let maxDistance = -1;
      let maxDistancePiece = null;

      ingestedMoves.forEach(move => {
        
        const fromSquare = move.from;
        const toSquare = move.to;
        //console.log(`fromSquare: ${fromSquare}`);
        //console.log(`toSquare: ${toSquare}`);


        function calculateDistance(fromSquare: string, toSquare: string) {
          let totalDistance;

          // Calculate the distance moved by the piece
          const fileDistance = Math.abs(fromSquare.charCodeAt(0) - toSquare.charCodeAt(0));
          const rankDistance = Math.abs(Number(fromSquare[1]) - Number(toSquare[1]));

          // Check if it's a diagonal move
          if (fileDistance === rankDistance) {
            // This is a diagonal move, count it as a single horizontal/vertical movement
            totalDistance = fileDistance;
            console.log(`Total distance moved: ${totalDistance}`);
          } 
          else {
            // Not a diagonal move, calculate the total distance, where one square = 1 unit of distance
            totalDistance = fileDistance + rankDistance;
            console.log(`Total distance moved: ${totalDistance}`);
          }
          return totalDistance;
        }

        // identifying the right piece to update the current position and distance of
        const thisPiece = chess.get(fromSquare as Square);
        if (thisPiece && thisPiece.type) {
          const color = thisPiece.color === 'w' ? 'w' : 'b';
          const pieceType = thisPiece.type.toUpperCase();

          // Iterate over the pieces object to find the piece with a matching currentPosition
          for (const pieceKey in pieces) {
            if (pieces[pieceKey].currentPosition === fromSquare) {
              // Found the piece, now update its currentPosition and distanceMoved
              pieces[pieceKey].currentPosition = toSquare;
              pieces[pieceKey].distanceMoved += calculateDistance(fromSquare, toSquare);
              console.log(pieces);

              // Update statistics for the piece and track which piece moved the furthest
              if (pieces[pieceKey].distanceMoved > maxDistance) {
                maxDistance = pieces[pieceKey].distanceMoved;
                maxDistancePiece = pieceKey;
              }
            }
          }
        }
      });

      // At this point, maxDistancePiece should contain the name of the piece with the maximum distance moved
      console.log(`Piece with the maximum distance moved: ${maxDistancePiece}`);
      console.log(`Distance moved: ${maxDistance}`);

      return {
        maxDistancePiece,
        maxDistance
      };

    } catch (error) {
      console.error('Error reading the file:', error);
      // Handle the error appropriately
    }
  }
}

// take a board and move and see if a capture occurred
function checkForCapture(board: Chess, move: string) {}

// start from back of history
function getMateAndAssists() {}

// This one could get complex if lib doesn't work https://github.com/jhlywa/chess.js/blob/master/README.md#isgameover
function determineEndType() {}

// I think this data may not exist in lichess
function timeQuit() {}

function miscChecksFromMove() {
  // en passant
  // castling
  // promotion
  // check
}
