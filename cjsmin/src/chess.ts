/**
 * @license
 * Copyright (c) 2023, Jeff Hlywa (jhlywa@gmail.com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

export const WHITE = 'w';
export const BLACK = 'b';

export const PAWN = 'p';
export const KNIGHT = 'n';
export const BISHOP = 'b';
export const ROOK = 'r';
export const QUEEN = 'q';
export const KING = 'k';

export type Color = 'w' | 'b';
// export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export type PrettyMove = {
  originalString: string | undefined;
  color: Color;
  fromIndex: number;
  toIndex: number;
  from: Square;
  to: Square;
  piece: PieceType;
  capture?: Capture | undefined;
  promotion?: PieceType | undefined;
  flags: string;
  uas: UnambiguousPieceSymbol;
};

export type UnambiguousPieceSymbol =
  | 'RA'
  | 'NB'
  | 'BC'
  | 'Q'
  | 'K'
  | 'BF'
  | 'NG'
  | 'RH'
  | 'PA'
  | 'PB'
  | 'PC'
  | 'PD'
  | 'PE'
  | 'PF'
  | 'PG'
  | 'PH'
  | 'ra'
  | 'nb'
  | 'bc'
  | 'q'
  | 'k'
  | 'bf'
  | 'ng'
  | 'rh'
  | 'pa'
  | 'pb'
  | 'pc'
  | 'pd'
  | 'pe'
  | 'pf'
  | 'pg'
  | 'ph';

// prettier-ignore
export type Square =
    'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8' |
    'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7' |
    'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6' |
    'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5' |
    'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4' |
    'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3' |
    'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2' |
    'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1'

const SQUARE_TO_STARTING_POSITION_MAP = {
  a1: 'RA',
  b1: 'NB',
  c1: 'BC',
  d1: 'Q',
  e1: 'K',
  f1: 'BF',
  g1: 'NG',
  h1: 'RH',
  a2: 'PA',
  b2: 'PB',
  c2: 'PC',
  d2: 'PD',
  e2: 'PE',
  f2: 'PF',
  g2: 'PG',
  h2: 'PH',
  a7: 'pa',
  b7: 'pb',
  c7: 'pc',
  d7: 'pd',
  e7: 'pe',
  f7: 'pf',
  g7: 'pg',
  h7: 'ph',
  a8: 'ra',
  b8: 'nb',
  c8: 'bc',
  d8: 'q',
  e8: 'k',
  f8: 'bf',
  g8: 'ng',
  h8: 'rh',
};

// prettier-ignore
export const ALL_SQUARES: Square[] = [
  "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1",
  "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
  "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3",
  "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4",
  "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5",
  "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6",
  "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
  "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"
]

// prettier-ignore
export const ALL_UNAMBIGUOUS_PIECE_SYMBOLS: UnambiguousPieceSymbol[] = [
  "RA", "NB", "BC", "Q", "K", "BF", "NG", "RH",
  "PA", "PB", "PC", "PD", "PE", "PF", "PG", "PH",
  "ra", "nb", "bc", "q", "k", "bf", "ng", "rh",
  "pa", "pb", "pc", "pd", "pe", "pf", "pg", "ph"
]

export const DEFAULT_POSITION =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export type Piece = {
  color: Color;
  type: PieceType;
  unambiguousSymbol: UnambiguousPieceSymbol;
};

type Capture = {
  type: PieceType;
  uas: UnambiguousPieceSymbol;
};

export type InternalMove = {
  color: Color;
  from: number;
  to: number;
  piece: PieceType;
  unambiguousSymbol: UnambiguousPieceSymbol;
  capture?: Capture;
  promotion?: PieceType;
  flags: number;
};

interface History {
  move: InternalMove;
  kings: Record<Color, number>;
  turn: Color;
  castling: Record<Color, number>;
  epSquare: number;
  halfMoves: number;
  moveNumber: number;
  originalString?: string;
}

export type Move = {
  color: Color;
  from: Square;
  to: Square;
  piece: PieceType;
  capture?: Capture;
  promotion?: PieceType;
  flags: string;
  umabiguousSymbol: UnambiguousPieceSymbol;
  // san: string;
  // lan: string;
  // before: string;
  // after: string;
};

const EMPTY = -1;

const FLAGS: Record<string, string> = {
  NORMAL: 'n',
  CAPTURE: 'c',
  BIG_PAWN: 'b',
  EP_CAPTURE: 'e',
  PROMOTION: 'p',
  KSIDE_CASTLE: 'k',
  QSIDE_CASTLE: 'q',
};

// prettier-ignore
export const SQUARES: Square[] = [
  'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
  'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
  'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
  'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
  'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
  'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
  'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
  'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
]

const BITS: Record<string, number> = {
  NORMAL: 1,
  CAPTURE: 2,
  BIG_PAWN: 4,
  EP_CAPTURE: 8,
  PROMOTION: 16,
  KSIDE_CASTLE: 32,
  QSIDE_CASTLE: 64,
};

/*
 * NOTES ABOUT 0x88 MOVE GENERATION ALGORITHM
 * ----------------------------------------------------------------------------
 * From https://github.com/jhlywa/chess.js/issues/230
 *
 * A lot of people are confused when they first see the internal representation
 * of chess.js. It uses the 0x88 Move Generation Algorithm which internally
 * stores the board as an 8x16 array. This is purely for efficiency but has a
 * couple of interesting benefits:
 *
 * 1. 0x88 offers a very inexpensive "off the board" check. Bitwise AND (&) any
 *    square with 0x88, if the result is non-zero then the square is off the
 *    board. For example, assuming a knight square A8 (0 in 0x88 notation),
 *    there are 8 possible directions in which the knight can move. These
 *    directions are relative to the 8x16 board and are stored in the
 *    PIECE_OFFSETS map. One possible move is A8 - 18 (up one square, and two
 *    squares to the left - which is off the board). 0 - 18 = -18 & 0x88 = 0x88
 *    (because of two-complement representation of -18). The non-zero result
 *    means the square is off the board and the move is illegal. Take the
 *    opposite move (from A8 to C7), 0 + 18 = 18 & 0x88 = 0. A result of zero
 *    means the square is on the board.
 *
 * 2. The relative distance (or difference) between two squares on a 8x16 board
 *    is unique and can be used to inexpensively determine if a piece on a
 *    square can attack any other arbitrary square. For example, let's see if a
 *    pawn on E7 can attack E2. The difference between E7 (20) - E2 (100) is
 *    -80. We add 119 to make the ATTACKS array index non-negative (because the
 *    worst case difference is A8 - H1 = -119). The ATTACKS array contains a
 *    bitmask of pieces that can attack from that distance and direction.
 *    ATTACKS[-80 + 119=39] gives us 24 or 0b11000 in binary. Look at the
 *    PIECE_MASKS map to determine the mask for a given piece type. In our pawn
 *    example, we would check to see if 24 & 0x1 is non-zero, which it is
 *    not. So, naturally, a pawn on E7 can't attack a piece on E2. However, a
 *    rook can since 24 & 0x8 is non-zero. The only thing left to check is that
 *    there are no blocking pieces between E7 and E2. That's where the RAYS
 *    array comes in. It provides an offset (in this case 16) to add to E7 (20)
 *    to check for blocking pieces. E7 (20) + 16 = E6 (36) + 16 = E5 (52) etc.
 */

// prettier-ignore
// eslint-disable-next-line
const Ox88: Record<Square, number> = {
  a8:   0, b8:   1, c8:   2, d8:   3, e8:   4, f8:   5, g8:   6, h8:   7,
  a7:  16, b7:  17, c7:  18, d7:  19, e7:  20, f7:  21, g7:  22, h7:  23,
  a6:  32, b6:  33, c6:  34, d6:  35, e6:  36, f6:  37, g6:  38, h6:  39,
  a5:  48, b5:  49, c5:  50, d5:  51, e5:  52, f5:  53, g5:  54, h5:  55,
  a4:  64, b4:  65, c4:  66, d4:  67, e4:  68, f4:  69, g4:  70, h4:  71,
  a3:  80, b3:  81, c3:  82, d3:  83, e3:  84, f3:  85, g3:  86, h3:  87,
  a2:  96, b2:  97, c2:  98, d2:  99, e2: 100, f2: 101, g2: 102, h2: 103,
  a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
}

const PAWN_OFFSETS = {
  b: [16, 32, 17, 15],
  w: [-16, -32, -17, -15],
};

const PIECE_OFFSETS = {
  n: [-18, -33, -31, -14, 18, 33, 31, 14],
  b: [-17, -15, 17, 15],
  r: [-16, 1, 16, -1],
  q: [-17, -16, -15, 1, 17, 16, 15, -1],
  k: [-17, -16, -15, 1, 17, 16, 15, -1],
};

// prettier-ignore
const ATTACKS = [
  20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20, 0,
   0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
   0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
   0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
   0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
   0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
   0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
  24,24,24,24,24,24,56,  0, 56,24,24,24,24,24,24, 0,
   0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
   0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
   0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
   0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
   0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
   0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
  20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20
];

// prettier-ignore
const RAYS = [
   17,  0,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0,  0, 15, 0,
    0, 17,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0, 15,  0, 0,
    0,  0, 17,  0,  0,  0,  0, 16,  0,  0,  0,  0, 15,  0,  0, 0,
    0,  0,  0, 17,  0,  0,  0, 16,  0,  0,  0, 15,  0,  0,  0, 0,
    0,  0,  0,  0, 17,  0,  0, 16,  0,  0, 15,  0,  0,  0,  0, 0,
    0,  0,  0,  0,  0, 17,  0, 16,  0, 15,  0,  0,  0,  0,  0, 0,
    0,  0,  0,  0,  0,  0, 17, 16, 15,  0,  0,  0,  0,  0,  0, 0,
    1,  1,  1,  1,  1,  1,  1,  0, -1, -1,  -1,-1, -1, -1, -1, 0,
    0,  0,  0,  0,  0,  0,-15,-16,-17,  0,  0,  0,  0,  0,  0, 0,
    0,  0,  0,  0,  0,-15,  0,-16,  0,-17,  0,  0,  0,  0,  0, 0,
    0,  0,  0,  0,-15,  0,  0,-16,  0,  0,-17,  0,  0,  0,  0, 0,
    0,  0,  0,-15,  0,  0,  0,-16,  0,  0,  0,-17,  0,  0,  0, 0,
    0,  0,-15,  0,  0,  0,  0,-16,  0,  0,  0,  0,-17,  0,  0, 0,
    0,-15,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,-17,  0, 0,
  -15,  0,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,  0,-17
];

const PIECE_MASKS = { p: 0x1, n: 0x2, b: 0x4, r: 0x8, q: 0x10, k: 0x20 };

const SYMBOLS = 'pnbrqkPNBRQK';

const PROMOTIONS: PieceType[] = [KNIGHT, BISHOP, ROOK, QUEEN];

const RANK_1 = 7;
const RANK_2 = 6;
/*
 * const RANK_3 = 5
 * const RANK_4 = 4
 * const RANK_5 = 3
 * const RANK_6 = 2
 */
const RANK_7 = 1;
const RANK_8 = 0;

const ROOKS = {
  w: [
    { square: Ox88.a1, flag: BITS.QSIDE_CASTLE },
    { square: Ox88.h1, flag: BITS.KSIDE_CASTLE },
  ],
  b: [
    { square: Ox88.a8, flag: BITS.QSIDE_CASTLE },
    { square: Ox88.h8, flag: BITS.KSIDE_CASTLE },
  ],
};

const SECOND_RANK = { b: RANK_7, w: RANK_2 };

const TERMINATION_MARKERS = ['1-0', '0-1', '1/2-1/2', '*'];

// Extracts the zero-based rank of an 0x88 square.
function rank(square: number): number {
  return square >> 4;
}

// Extracts the zero-based file of an 0x88 square.
function file(square: number): number {
  return square & 0xf;
}

function isDigit(c: string): boolean {
  return '0123456789'.indexOf(c) !== -1;
}

// Converts a 0x88 square to algebraic notation.
function algebraic(square: number): Square {
  const f = file(square);
  const r = rank(square);
  return ('abcdefgh'.substring(f, f + 1) +
    '87654321'.substring(r, r + 1)) as Square;
}

function swapColor(color: Color): Color {
  return color === WHITE ? BLACK : WHITE;
}

export function validateFen(fen: string) {
  // 1st criterion: 6 space-seperated fields?
  const tokens = fen.split(/\s+/);
  if (tokens.length !== 6) {
    return {
      ok: false,
      error: 'Invalid FEN: must contain six space-delimited fields',
    };
  }

  // 2nd criterion: move number field is a integer value > 0?
  const moveNumber = parseInt(tokens[5], 10);
  if (isNaN(moveNumber) || moveNumber <= 0) {
    return {
      ok: false,
      error: 'Invalid FEN: move number must be a positive integer',
    };
  }

  // 3rd criterion: half move counter is an integer >= 0?
  const halfMoves = parseInt(tokens[4], 10);
  if (isNaN(halfMoves) || halfMoves < 0) {
    return {
      ok: false,
      error:
        'Invalid FEN: half move counter number must be a non-negative integer',
    };
  }

  // 4th criterion: 4th field is a valid e.p.-string?
  if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
    return { ok: false, error: 'Invalid FEN: en-passant square is invalid' };
  }

  // 5th criterion: 3th field is a valid castle-string?
  if (/[^kKqQ-]/.test(tokens[2])) {
    return {
      ok: false,
      error: 'Invalid FEN: castling availability is invalid',
    };
  }

  // 6th criterion: 2nd field is "w" (white) or "b" (black)?
  if (!/^(w|b)$/.test(tokens[1])) {
    return { ok: false, error: 'Invalid FEN: side-to-move is invalid' };
  }

  // 7th criterion: 1st field contains 8 rows?
  const rows = tokens[0].split('/');
  if (rows.length !== 8) {
    return {
      ok: false,
      error: "Invalid FEN: piece data does not contain 8 '/'-delimited rows",
    };
  }

  // 8th criterion: every row is valid?
  for (let i = 0; i < rows.length; i++) {
    // check for right sum of fields AND not two numbers in succession
    let sumFields = 0;
    let previousWasNumber = false;

    for (let k = 0; k < rows[i].length; k++) {
      if (isDigit(rows[i][k])) {
        if (previousWasNumber) {
          return {
            ok: false,
            error: 'Invalid FEN: piece data is invalid (consecutive number)',
          };
        }
        sumFields += parseInt(rows[i][k], 10);
        previousWasNumber = true;
      } else {
        if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
          return {
            ok: false,
            error: 'Invalid FEN: piece data is invalid (invalid piece)',
          };
        }
        sumFields += 1;
        previousWasNumber = false;
      }
    }
    if (sumFields !== 8) {
      return {
        ok: false,
        error: 'Invalid FEN: piece data is invalid (too many squares in rank)',
      };
    }
  }

  // 9th criterion: is en-passant square legal?
  if (
    (tokens[3][1] == '3' && tokens[1] == 'w') ||
    (tokens[3][1] == '6' && tokens[1] == 'b')
  ) {
    return { ok: false, error: 'Invalid FEN: illegal en-passant square' };
  }

  // 10th criterion: does chess position contain exact two kings?
  const kings = [
    { color: 'white', regex: /K/g },
    { color: 'black', regex: /k/g },
  ];

  for (const { color, regex } of kings) {
    if (!regex.test(tokens[0])) {
      return { ok: false, error: `Invalid FEN: missing ${color} king` };
    }

    if ((tokens[0].match(regex) || []).length > 1) {
      return { ok: false, error: `Invalid FEN: too many ${color} kings` };
    }
  }

  // 11th criterion: are any pawns on the first or eighth rows?
  if (
    Array.from(rows[0] + rows[7]).some((char) => char.toUpperCase() === 'P')
  ) {
    return {
      ok: false,
      error: 'Invalid FEN: some pawns are on the edge rows',
    };
  }

  return { ok: true };
}

// this function is used to uniquely identify ambiguous moves
function getDisambiguator(move: InternalMove, moves: InternalMove[]) {
  const from = move.from;
  const to = move.to;
  const piece = move.piece;

  let ambiguities = 0;
  let sameRank = 0;
  let sameFile = 0;

  for (let i = 0, len = moves.length; i < len; i++) {
    const ambigFrom = moves[i].from;
    const ambigTo = moves[i].to;
    const ambigPiece = moves[i].piece;

    /*
     * if a move of the same piece type ends on the same to square, we'll need
     * to add a disambiguator to the algebraic notation
     */
    if (piece === ambigPiece && from !== ambigFrom && to === ambigTo) {
      ambiguities++;

      if (rank(from) === rank(ambigFrom)) {
        sameRank++;
      }

      if (file(from) === file(ambigFrom)) {
        sameFile++;
      }
    }
  }

  if (ambiguities > 0) {
    if (sameRank > 0 && sameFile > 0) {
      /*
       * if there exists a similar moving piece on the same rank and file as
       * the move in question, use the square as the disambiguator
       */
      return algebraic(from);
    } else if (sameFile > 0) {
      /*
       * if the moving piece rests on the same file, use the rank symbol as the
       * disambiguator
       */
      return algebraic(from).charAt(1);
    } else {
      // else use the file symbol
      return algebraic(from).charAt(0);
    }
  }

  return '';
}

function inferPieceType(san: string) {
  let pieceType = san.charAt(0);
  // If the first character is between 'a' and 'h', it's a pawn move
  if (pieceType >= 'a' && pieceType <= 'h') {
    const matches = san.match(/[a-h]\d.*[a-h]\d/);
    if (matches) {
      return undefined;
    }
    return PAWN;
  }
  pieceType = pieceType.toLowerCase();
  // If the first character is 'o', it's a king move (castling)
  if (pieceType === 'o') {
    return KING;
  }
  // Otherwise, return the piece type as is
  return pieceType as PieceType;
}

// Parses all of the decorators out of a SAN string
function strippedSan(move: string) {
  // Remove equals sign (pawn promotion) and trailing characters (check, checkmate, annotations)
  return move.replace(/=/, '').replace(/[+#]?[?!]*$/, '');
}

function addMove(
  moves: InternalMove[],
  color: Color,
  from: number,
  to: number,
  piece: PieceType,
  unambiguousSymbol: UnambiguousPieceSymbol,
  capture: Capture | undefined = undefined,
  flags: number = BITS.NORMAL
) {
  const r = rank(to);

  if (piece === PAWN && (r === RANK_1 || r === RANK_8)) {
    for (let i = 0; i < PROMOTIONS.length; i++) {
      const promotion = PROMOTIONS[i];
      moves.push({
        color,
        from,
        to,
        piece,
        capture,
        promotion,
        unambiguousSymbol,
        flags: flags | BITS.PROMOTION,
      });
    }
  } else {
    moves.push({
      color,
      from,
      to,
      piece,
      capture,
      unambiguousSymbol,
      flags,
    });
  }
}

export class Chess {
  _board = new Array<Piece>(128);
  _turn: Color = WHITE;
  _header: Record<string, string> = {};
  _kings: Record<Color, number> = { w: EMPTY, b: EMPTY };
  _epSquare = -1;
  _halfMoves = 0;
  _moveNumber = 0;
  _history: History[] = [];
  _castling: Record<Color, number> = { w: 0, b: 0 };

  constructor() {
    this.load(DEFAULT_POSITION);
  }

  clear(keepHeaders = false) {
    this._board = new Array<Piece>(128);
    this._kings = { w: EMPTY, b: EMPTY };
    this._turn = WHITE;
    this._castling = { w: 0, b: 0 };
    this._epSquare = EMPTY;
    this._halfMoves = 0;
    this._moveNumber = 1;
    this._history = [];
    this._header = keepHeaders ? this._header : {};
    this._updateSetup(this.fen());
  }

  load(fen: string, keepHeaders = false) {
    let tokens = fen.split(/\s+/);

    // append commonly omitted fen tokens
    if (tokens.length >= 2 && tokens.length < 6) {
      const adjustments = ['-', '-', '0', '1'];
      fen = tokens.concat(adjustments.slice(-(6 - tokens.length))).join(' ');
    }

    tokens = fen.split(/\s+/);

    const { ok, error } = validateFen(fen);
    if (!ok) {
      throw new Error(error);
    }

    const position = tokens[0];
    let square = 0;

    this.clear(keepHeaders);

    for (let i = 0; i < position.length; i++) {
      const piece = position.charAt(i);

      if (piece === '/') {
        square += 8;
      } else if (isDigit(piece)) {
        square += parseInt(piece, 10);
      } else {
        const color = piece < 'a' ? WHITE : BLACK;
        this._put(
          { type: piece.toLowerCase() as PieceType, color },
          algebraic(square)
        );
        square++;
      }
    }

    this._turn = tokens[1] as Color;

    if (tokens[2].indexOf('K') > -1) {
      this._castling.w |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('Q') > -1) {
      this._castling.w |= BITS.QSIDE_CASTLE;
    }
    if (tokens[2].indexOf('k') > -1) {
      this._castling.b |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('q') > -1) {
      this._castling.b |= BITS.QSIDE_CASTLE;
    }

    this._epSquare = tokens[3] === '-' ? EMPTY : Ox88[tokens[3] as Square];
    this._halfMoves = parseInt(tokens[4], 10);
    this._moveNumber = parseInt(tokens[5], 10);

    this._updateSetup(this.fen());
  }

  fen() {
    let empty = 0;
    let fen = '';

    for (let i = Ox88.a8; i <= Ox88.h1; i++) {
      if (this._board[i]) {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        const { color, type: piece } = this._board[i];

        fen += color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
      } else {
        empty++;
      }

      if ((i + 1) & 0x88) {
        if (empty > 0) {
          fen += empty;
        }

        if (i !== Ox88.h1) {
          fen += '/';
        }

        empty = 0;
        i += 8;
      }
    }

    let castling = '';
    if (this._castling[WHITE] & BITS.KSIDE_CASTLE) {
      castling += 'K';
    }
    if (this._castling[WHITE] & BITS.QSIDE_CASTLE) {
      castling += 'Q';
    }
    if (this._castling[BLACK] & BITS.KSIDE_CASTLE) {
      castling += 'k';
    }
    if (this._castling[BLACK] & BITS.QSIDE_CASTLE) {
      castling += 'q';
    }

    // do we have an empty castling flag?
    castling = castling || '-';

    let epSquare = '-';
    /*
     * only print the ep square if en passant is a valid move (pawn is present
     * and ep capture is not pinned)
     */
    if (this._epSquare !== EMPTY) {
      const bigPawnSquare = this._epSquare + (this._turn === WHITE ? 16 : -16);
      const squares = [bigPawnSquare + 1, bigPawnSquare - 1];

      for (const square of squares) {
        // is the square off the board?
        if (square & 0x88) {
          continue;
        }

        const color = this._turn;

        // is there a pawn that can capture the epSquare?
        if (
          this._board[square]?.color === color &&
          this._board[square]?.type === PAWN
        ) {
          // if the pawn makes an ep capture, does it leave it's king in check?
          this._makeMove({
            color,
            from: square,
            to: this._epSquare,
            piece: PAWN,
            unambiguousSymbol: this._board[square]?.unambiguousSymbol,
            capture: {
              type: PAWN,
              uas: this._board[square]?.unambiguousSymbol,
            },
            flags: BITS.EP_CAPTURE,
          });
          const isLegal = !this._isKingAttacked(color);
          this._undoMove();

          // if ep is legal, break and set the ep square in the FEN output
          if (isLegal) {
            epSquare = algebraic(this._epSquare);
            break;
          }
        }
      }
    }

    return [
      fen,
      this._turn,
      castling,
      epSquare,
      this._halfMoves,
      this._moveNumber,
    ].join(' ');
  }

  /*
   * Called when the initial board setup is changed with put() or remove().
   * modifies the SetUp and FEN properties of the header object. If the FEN
   * is equal to the default position, the SetUp and FEN are deleted the setup
   * is only updated if history.length is zero, ie moves haven't been made.
   */
  private _updateSetup(fen: string) {
    if (this._history.length > 0) return;

    if (fen !== DEFAULT_POSITION) {
      this._header['SetUp'] = '1';
      this._header['FEN'] = fen;
    } else {
      delete this._header['SetUp'];
      delete this._header['FEN'];
    }
  }

  get(square: Square) {
    return this._board[Ox88[square]] || false;
  }

  unambiguousMap() {}

  private _put(
    { type, color }: { type: PieceType; color: Color },
    square: Square
  ) {
    //@ts-ignore this breaks for non init
    const unambiguousSymbol = SQUARE_TO_STARTING_POSITION_MAP[
      square
    ] as UnambiguousPieceSymbol;

    // check for piece
    if (SYMBOLS.indexOf(type.toLowerCase()) === -1) {
      return false;
    }

    // check for valid square
    if (!(square in Ox88)) {
      return false;
    }

    const sq = Ox88[square];

    // don't let the user place more than one king
    if (
      type == KING &&
      !(this._kings[color] == EMPTY || this._kings[color] == sq)
    ) {
      return false;
    }

    this._board[sq] = {
      type: type as PieceType,
      color: color as Color,
      unambiguousSymbol,
    };

    if (type === KING) {
      this._kings[color] = sq;
    }

    this._updateCastlingRights();
    this._updateEnPassantSquare();
    this._updateSetup(this.fen());

    return true;
  }

  remove(square: Square) {
    const piece = this.get(square);
    delete this._board[Ox88[square]];
    if (piece && piece.type === KING) {
      this._kings[piece.color] = EMPTY;
    }

    this._updateCastlingRights();
    this._updateEnPassantSquare();
    this._updateSetup(this.fen());

    return piece;
  }

  _updateCastlingRights() {
    const whiteKingInPlace =
      this._board[Ox88.e1]?.type === KING &&
      this._board[Ox88.e1]?.color === WHITE;
    const blackKingInPlace =
      this._board[Ox88.e8]?.type === KING &&
      this._board[Ox88.e8]?.color === BLACK;

    if (
      !whiteKingInPlace ||
      this._board[Ox88.a1]?.type !== ROOK ||
      this._board[Ox88.a1]?.color !== WHITE
    ) {
      this._castling.w &= ~BITS.QSIDE_CASTLE;
    }

    if (
      !whiteKingInPlace ||
      this._board[Ox88.h1]?.type !== ROOK ||
      this._board[Ox88.h1]?.color !== WHITE
    ) {
      this._castling.w &= ~BITS.KSIDE_CASTLE;
    }

    if (
      !blackKingInPlace ||
      this._board[Ox88.a8]?.type !== ROOK ||
      this._board[Ox88.a8]?.color !== BLACK
    ) {
      this._castling.b &= ~BITS.QSIDE_CASTLE;
    }

    if (
      !blackKingInPlace ||
      this._board[Ox88.h8]?.type !== ROOK ||
      this._board[Ox88.h8]?.color !== BLACK
    ) {
      this._castling.b &= ~BITS.KSIDE_CASTLE;
    }
  }

  _updateEnPassantSquare() {
    if (this._epSquare === EMPTY) {
      return;
    }

    const startSquare = this._epSquare + (this._turn === WHITE ? -16 : 16);
    const currentSquare = this._epSquare + (this._turn === WHITE ? 16 : -16);
    const attackers = [currentSquare + 1, currentSquare - 1];

    if (
      this._board[startSquare] !== null ||
      this._board[this._epSquare] !== null ||
      this._board[currentSquare]?.color !== swapColor(this._turn) ||
      this._board[currentSquare]?.type !== PAWN
    ) {
      this._epSquare = EMPTY;
      return;
    }

    const canCapture = (square: number) =>
      !(square & 0x88) &&
      this._board[square]?.color === this._turn &&
      this._board[square]?.type === PAWN;

    if (!attackers.some(canCapture)) {
      this._epSquare = EMPTY;
    }
  }

  _attacked(color: Color, square: number) {
    for (let i = Ox88.a8; i <= Ox88.h1; i++) {
      // did we run off the end of the board
      if (i & 0x88) {
        i += 7;
        continue;
      }

      // if empty square or wrong color
      if (this._board[i] === undefined || this._board[i].color !== color) {
        continue;
      }

      const piece = this._board[i];
      const difference = i - square;

      // skip - to/from square are the same
      if (difference === 0) {
        continue;
      }

      const index = difference + 119;

      if (ATTACKS[index] & PIECE_MASKS[piece.type]) {
        if (piece.type === PAWN) {
          if (difference > 0) {
            if (piece.color === WHITE) return true;
          } else {
            if (piece.color === BLACK) return true;
          }
          continue;
        }

        // if the piece is a knight or a king
        if (piece.type === 'n' || piece.type === 'k') return true;

        const offset = RAYS[index];
        let j = i + offset;

        let blocked = false;
        while (j !== square) {
          if (this._board[j] != null) {
            blocked = true;
            break;
          }
          j += offset;
        }

        if (!blocked) return true;
      }
    }

    return false;
  }

  _attackFromSquares(color: Color, square: number): number[] {
    const attackingSquares = [];
    for (let i = Ox88.a8; i <= Ox88.h1; i++) {
      // did we run off the end of the board
      if (i & 0x88) {
        i += 7;
        continue;
      }

      // if empty square or wrong color
      if (this._board[i] === undefined || this._board[i].color !== color) {
        continue;
      }

      const piece = this._board[i];
      const difference = i - square;

      // skip - to/from square are the same
      if (difference === 0) {
        continue;
      }

      const index = difference + 119;

      if (ATTACKS[index] & PIECE_MASKS[piece.type]) {
        if (piece.type === PAWN) {
          if (difference > 0) {
            if (piece.color === WHITE) attackingSquares.push(i);
          } else {
            if (piece.color === BLACK) attackingSquares.push(i);
          }
          continue;
        }

        // if the piece is a knight or a king
        if (piece.type === 'n' || piece.type === 'k') attackingSquares.push(i);

        const offset = RAYS[index];
        let j = i + offset;

        let blocked = false;
        while (j !== square) {
          if (this._board[j] != null) {
            blocked = true;
            break;
          }
          j += offset;
        }

        if (!blocked) attackingSquares.push(i);
      }
    }

    return attackingSquares;
  }

  private _isKingAttacked(color: Color) {
    const square = this._kings[color];
    return square === -1 ? false : this._attacked(swapColor(color), square);
  }

  isAttacked(square: Square, attackedBy: Color) {
    return this._attacked(attackedBy, Ox88[square]);
  }

  isCheck() {
    return this._isKingAttacked(this._turn);
  }

  inCheck() {
    return this.isCheck();
  }

  isCheckmate() {
    return this.isCheck() && this._moves().length === 0;
  }

  isStalemate() {
    return !this.isCheck() && this._moves().length === 0;
  }

  isInsufficientMaterial() {
    /*
     * k.b. vs k.b. (of opposite colors) with mate in 1:
     * 8/8/8/8/1b6/8/B1k5/K7 b - - 0 1
     *
     * k.b. vs k.n. with mate in 1:
     * 8/8/8/8/1n6/8/B7/K1k5 b - - 2 1
     */
    const pieces: Record<PieceType, number> = {
      b: 0,
      n: 0,
      r: 0,
      q: 0,
      k: 0,
      p: 0,
    };
    const bishops = [];
    let numPieces = 0;
    let squareColor = 0;

    for (let i = Ox88.a8; i <= Ox88.h1; i++) {
      squareColor = (squareColor + 1) % 2;
      if (i & 0x88) {
        i += 7;
        continue;
      }

      const piece = this._board[i];
      if (piece) {
        pieces[piece.type] = piece.type in pieces ? pieces[piece.type] + 1 : 1;
        if (piece.type === BISHOP) {
          bishops.push(squareColor);
        }
        numPieces++;
      }
    }

    // k vs. k
    if (numPieces === 2) {
      return true;
    } else if (
      // k vs. kn .... or .... k vs. kb
      numPieces === 3 &&
      (pieces[BISHOP] === 1 || pieces[KNIGHT] === 1)
    ) {
      return true;
    } else if (numPieces === pieces[BISHOP] + 2) {
      // kb vs. kb where any number of bishops are all on the same color
      let sum = 0;
      const len = bishops.length;
      for (let i = 0; i < len; i++) {
        sum += bishops[i];
      }
      if (sum === 0 || sum === len) {
        return true;
      }
    }

    return false;
  }

  isDraw() {
    return (
      this._halfMoves >= 100 || // 50 moves per side = 100 half moves
      this.isStalemate() ||
      this.isInsufficientMaterial()
    );
  }

  isGameOver() {
    return this.isCheckmate() || this.isStalemate() || this.isDraw();
  }

  _moves({
    legal = true,
    piece = undefined,
    square = undefined,
  }: {
    legal?: boolean;
    piece?: PieceType;
    square?: Square;
  } = {}) {
    const forSquare = square ? (square.toLowerCase() as Square) : undefined;
    const forPiece = piece?.toLowerCase();

    const moves: InternalMove[] = [];
    const us = this._turn;
    const them = swapColor(us);

    let firstSquare = Ox88.a8;
    let lastSquare = Ox88.h1;
    let singleSquare = false;

    // are we generating moves for a single square?
    if (forSquare) {
      // illegal square, return empty moves
      if (!(forSquare in Ox88)) {
        return [];
      } else {
        firstSquare = lastSquare = Ox88[forSquare];
        singleSquare = true;
      }
    }

    for (let from = firstSquare; from <= lastSquare; from++) {
      // did we run off the end of the board
      if (from & 0x88) {
        from += 7;
        continue;
      }

      // empty square or opponent, skip
      if (!this._board[from] || this._board[from].color === them) {
        continue;
      }
      const { type } = this._board[from];

      let to: number;
      if (type === PAWN) {
        if (forPiece && forPiece !== type) continue;

        // single square, non-capturing
        to = from + PAWN_OFFSETS[us][0];
        if (!this._board[to]) {
          addMove(
            moves,
            us,
            from,
            to,
            PAWN,
            this._board[from].unambiguousSymbol
          );

          // double square
          to = from + PAWN_OFFSETS[us][1];
          if (SECOND_RANK[us] === rank(from) && !this._board[to]) {
            addMove(
              moves,
              us,
              from,
              to,
              PAWN,
              this._board[from].unambiguousSymbol,
              undefined,
              BITS.BIG_PAWN
            );
          }
        }

        // pawn captures
        for (let j = 2; j < 4; j++) {
          to = from + PAWN_OFFSETS[us][j];
          if (to & 0x88) continue;

          if (this._board[to]?.color === them) {
            addMove(
              moves,
              us,
              from,
              to,
              PAWN,
              this._board[from].unambiguousSymbol,
              {
                type: this._board[to].type,
                uas: this._board[to].unambiguousSymbol,
              },
              BITS.CAPTURE
            );
          } else if (to === this._epSquare) {
            // for the unambiguous symbol we can get the file and casing
            const file = algebraic(to).charAt(0);
            let uas = 'p' + file;
            if (us === BLACK) {
              uas = uas.toUpperCase();
            }

            addMove(
              moves,
              us,
              from,
              to,
              PAWN,
              this._board[from].unambiguousSymbol,
              {
                type: PAWN,
                uas: uas as UnambiguousPieceSymbol,
              },
              BITS.EP_CAPTURE
            );
          }
        }
      } else {
        if (forPiece && forPiece !== type) continue;

        for (let j = 0, len = PIECE_OFFSETS[type].length; j < len; j++) {
          const offset = PIECE_OFFSETS[type][j];
          to = from;

          while (true) {
            to += offset;
            if (to & 0x88) break;

            if (!this._board[to]) {
              addMove(
                moves,
                us,
                from,
                to,
                type,
                this._board[from].unambiguousSymbol
              );
            } else {
              // own color, stop loop
              if (this._board[to].color === us) break;

              addMove(
                moves,
                us,
                from,
                to,
                type,
                this._board[from].unambiguousSymbol,
                {
                  type: this._board[to].type,
                  uas: this._board[to].unambiguousSymbol,
                },
                BITS.CAPTURE
              );
              break;
            }

            /* break, if knight or king */
            if (type === KNIGHT || type === KING) break;
          }
        }
      }
    }

    /*
     * check for castling if we're:
     *   a) generating all moves, or
     *   b) doing single square move generation on the king's square
     */

    if (forPiece === undefined || forPiece === KING) {
      if (!singleSquare || lastSquare === this._kings[us]) {
        // king-side castling
        if (this._castling[us] & BITS.KSIDE_CASTLE) {
          const castlingFrom = this._kings[us];
          const castlingTo = castlingFrom + 2;

          if (
            !this._board[castlingFrom + 1] &&
            !this._board[castlingTo] &&
            !this._attacked(them, this._kings[us]) &&
            !this._attacked(them, castlingFrom + 1) &&
            !this._attacked(them, castlingTo)
          ) {
            addMove(
              moves,
              us,
              this._kings[us],
              castlingTo,
              KING,
              this._board[this._kings[us]].unambiguousSymbol,
              undefined,
              BITS.KSIDE_CASTLE
            );
          }
        }

        // queen-side castling
        if (this._castling[us] & BITS.QSIDE_CASTLE) {
          const castlingFrom = this._kings[us];
          const castlingTo = castlingFrom - 2;

          if (
            !this._board[castlingFrom - 1] &&
            !this._board[castlingFrom - 2] &&
            !this._board[castlingFrom - 3] &&
            !this._attacked(them, this._kings[us]) &&
            !this._attacked(them, castlingFrom - 1) &&
            !this._attacked(them, castlingTo)
          ) {
            addMove(
              moves,
              us,
              this._kings[us],
              castlingTo,
              KING,
              this._board[this._kings[us]].unambiguousSymbol,
              undefined,
              BITS.QSIDE_CASTLE
            );
          }
        }
      }
    }

    /*
     * return all pseudo-legal moves (this includes moves that allow the king
     * to be captured)
     */
    if (!legal || this._kings[us] === -1) {
      return moves;
    }

    // filter out illegal moves
    const legalMoves = [];

    for (let i = 0, len = moves.length; i < len; i++) {
      this._makeMove(moves[i]);
      if (!this._isKingAttacked(us)) {
        legalMoves.push(moves[i]);
      }
      this._undoMove();
    }

    return legalMoves;
  }

  _push(move: InternalMove, originalString?: string) {
    this._history.push({
      move,
      kings: { b: this._kings.b, w: this._kings.w },
      turn: this._turn,
      castling: { b: this._castling.b, w: this._castling.w },
      epSquare: this._epSquare,
      halfMoves: this._halfMoves,
      moveNumber: this._moveNumber,
      originalString,
    });
  }

  private _makeMove(move: InternalMove, originalString?: string) {
    const us = this._turn;
    const them = swapColor(us);
    this._push(move, originalString);

    this._board[move.to] = this._board[move.from];
    delete this._board[move.from];

    // if ep capture, remove the captured pawn
    if (move.flags & BITS.EP_CAPTURE) {
      if (this._turn === BLACK) {
        delete this._board[move.to - 16];
      } else {
        delete this._board[move.to + 16];
      }
    }

    // if pawn promotion, replace with new piece
    if (move.promotion) {
      this._board[move.to] = {
        type: move.promotion,
        color: us,
        unambiguousSymbol: this._board[move.to].unambiguousSymbol,
      };
    }

    // if we moved the king
    if (this._board[move.to].type === KING) {
      this._kings[us] = move.to;

      // if we castled, move the rook next to the king
      if (move.flags & BITS.KSIDE_CASTLE) {
        const castlingTo = move.to - 1;
        const castlingFrom = move.to + 1;
        this._board[castlingTo] = this._board[castlingFrom];
        delete this._board[castlingFrom];
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        const castlingTo = move.to + 1;
        const castlingFrom = move.to - 2;
        this._board[castlingTo] = this._board[castlingFrom];
        delete this._board[castlingFrom];
      }

      // turn off castling
      this._castling[us] = 0;
    }

    // turn off castling if we move a rook
    if (this._castling[us]) {
      for (let i = 0, len = ROOKS[us].length; i < len; i++) {
        if (
          move.from === ROOKS[us][i].square &&
          this._castling[us] & ROOKS[us][i].flag
        ) {
          this._castling[us] ^= ROOKS[us][i].flag;
          break;
        }
      }
    }

    // turn off castling if we capture a rook
    if (this._castling[them]) {
      for (let i = 0, len = ROOKS[them].length; i < len; i++) {
        if (
          move.to === ROOKS[them][i].square &&
          this._castling[them] & ROOKS[them][i].flag
        ) {
          this._castling[them] ^= ROOKS[them][i].flag;
          break;
        }
      }
    }

    // if big pawn move, update the en passant square
    if (move.flags & BITS.BIG_PAWN) {
      if (us === BLACK) {
        this._epSquare = move.to - 16;
      } else {
        this._epSquare = move.to + 16;
      }
    } else {
      this._epSquare = EMPTY;
    }

    // reset the 50 move counter if a pawn is moved or a piece is captured
    if (move.piece === PAWN) {
      this._halfMoves = 0;
    } else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
      this._halfMoves = 0;
    } else {
      this._halfMoves++;
    }

    if (us === BLACK) {
      this._moveNumber++;
    }

    this._turn = them;
  }

  private _makeAndReturnMove(
    move: InternalMove,
    originalString?: string
  ): InternalMove {
    this._makeMove(move, originalString);
    return move;
  }

  private _undoMove() {
    const old = this._history.pop();
    if (old === undefined) {
      return null;
    }

    const move = old.move;

    this._kings = old.kings;
    this._turn = old.turn;
    this._castling = old.castling;
    this._epSquare = old.epSquare;
    this._halfMoves = old.halfMoves;
    this._moveNumber = old.moveNumber;

    const us = this._turn;
    const them = swapColor(us);

    this._board[move.from] = this._board[move.to];
    this._board[move.from].type = move.piece; // to undo any promotions
    delete this._board[move.to];

    if (move.capture) {
      if (move.flags & BITS.EP_CAPTURE) {
        // en passant capture
        let index: number;
        if (us === BLACK) {
          index = move.to - 16;
        } else {
          index = move.to + 16;
        }

        this._board[index] = {
          type: PAWN,
          color: them,
          unambiguousSymbol: move.capture.uas,
        };
      } else {
        // regular capture
        this._board[move.to] = {
          type: move.capture.type,
          color: them,
          // TODO: Implement unambiguousSymbol
          unambiguousSymbol: move.capture.uas,
        };
      }
    }

    if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
      let castlingTo: number, castlingFrom: number;
      if (move.flags & BITS.KSIDE_CASTLE) {
        castlingTo = move.to + 1;
        castlingFrom = move.to - 1;
      } else {
        castlingTo = move.to - 2;
        castlingFrom = move.to + 1;
      }

      this._board[castlingTo] = this._board[castlingFrom];
      delete this._board[castlingFrom];
    }

    return move;
  }

  // TODO: use this instead of current setup
  initialize() {
    this._board = new Array<Piece>(128);
    this._kings = { w: EMPTY, b: EMPTY };
    this._turn = WHITE;
    this._castling = { w: 96, b: 96 };
    this._epSquare = EMPTY;
    this._halfMoves = 0;
    this._moveNumber = 1;
    this._history = [];
    this._turn = 'w' as Color;

    this._castling.w |= BITS.KSIDE_CASTLE;
    this._castling.w |= BITS.QSIDE_CASTLE;
    this._castling.b |= BITS.KSIDE_CASTLE;
    this._castling.b |= BITS.QSIDE_CASTLE;

    this._epSquare = EMPTY;
    this._halfMoves = 0;
    this._moveNumber = 1;
  }

  loadPgn(
    pgnMoveLine: string,
    { strict = false }: { strict?: boolean; newlineChar?: string } = {}
  ) {
    this.load(DEFAULT_POSITION);

    // We don't mind destructive deletion of the comments
    let ms = pgnMoveLine.replace(new RegExp(`({[^}]*})+?`, 'g'), '');

    // delete move numbers
    ms = ms.replace(/\d+\.(\.\.)?/g, '');

    // delete ... indicating black to move
    ms = ms.replace('...', '');

    /* delete numeric annotation glyphs */
    ms = ms.replace(/\$\d+/g, '');

    // trim and get array of moves
    // let moves = ms.trim().split(new RegExp(/\s+/));
    let moves = ms.trim().split(' ');

    // delete empty entries
    moves = moves.filter((move) => move !== '');

    for (let halfMove = 0; halfMove < moves.length; halfMove++) {
      const move = this._moveFromSan(moves[halfMove], strict);

      // invalid move
      if (move == null) {
        // was the move an end of game marker
        if (!(TERMINATION_MARKERS.indexOf(moves[halfMove]) > -1)) {
          throw new Error(`Invalid move in PGN: ${moves[halfMove]}`);
        }
      } else {
        // reset the end of game marker if making a valid move
        this._makeMove(move, moves[halfMove]);
      }
    }
  }

  *historyGenerator(
    pgnMoveLine: string,
    { strict = false }: { strict?: boolean; newlineChar?: string } = {}
  ): Generator<{ move: PrettyMove; board: Array<Piece> }, void, void> {
    this.load(DEFAULT_POSITION);

    // We don't mind destructive deletion of the comments
    let ms = pgnMoveLine.replace(new RegExp(`({[^}]*})+?`, 'g'), '');

    // delete move numbers
    ms = ms.replace(/\d+\.(\.\.)?/g, '');

    // delete ... indicating black to move
    ms = ms.replace('...', '');

    /* delete numeric annotation glyphs */
    ms = ms.replace(/\$\d+/g, '');

    // trim and get array of moves
    // let moves = ms.trim().split(new RegExp(/\s+/));
    let moves = ms.trim().split(' ');

    // delete empty entries
    moves = moves.filter((move) => move !== '');

    for (let halfMove = 0; halfMove < moves.length; halfMove++) {
      const move = this._moveFromSan(moves[halfMove], strict);

      // invalid move
      if (move == null) {
        // was the move an end of game marker
        if (!(TERMINATION_MARKERS.indexOf(moves[halfMove]) > -1)) {
          throw new Error(`Invalid move in PGN: ${moves[halfMove]}`);
        }
      } else {
        // reset the end of game marker if making a valid move
        this._makeMove(move, moves[halfMove]);
        const prettyMove = {
          ...this._makePretty(move, moves[halfMove]),
          originalString: moves[halfMove],
        };
        yield {
          move: prettyMove,
          board: this._board,
        };
      }
    }
  }

  /*
   * Convert a move from 0x88 coordinates to Standard Algebraic Notation
   * (SAN)
   *
   * @param {boolean} strict Use the strict SAN parser. It will throw errors
   * on overly disambiguated moves (see below):
   *
   * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
   * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
   * 4. ... Ne7 is technically the valid SAN
   */

  private _moveToSan(move: InternalMove, moves: InternalMove[]) {
    let output = '';

    if (move.flags & BITS.KSIDE_CASTLE) {
      output = 'O-O';
    } else if (move.flags & BITS.QSIDE_CASTLE) {
      output = 'O-O-O';
    } else {
      if (move.piece !== PAWN) {
        const disambiguator = getDisambiguator(move, moves);
        output += move.piece.toUpperCase() + disambiguator;
      }

      if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
        if (move.piece === PAWN) {
          output += algebraic(move.from)[0];
        }
        output += 'x';
      }

      output += algebraic(move.to);

      if (move.promotion) {
        output += '=' + move.promotion.toUpperCase();
      }
    }

    this._makeMove(move);
    if (this.isCheck()) {
      if (this.isCheckmate()) {
        output += '#';
      } else {
        output += '+';
      }
    }
    this._undoMove();

    return output;
  }

  // convert a move from Standard Algebraic Notation (SAN) to 0x88 coordinates
  private _moveFromSan(move: string, strict = true): InternalMove | null {
    // strip off any move decorations: e.g Nf3+?! becomes Nf3
    const cleanMove = strippedSan(move);

    let pieceType = inferPieceType(cleanMove);
    let moves = this._moves({ legal: true, piece: pieceType });

    // strict parser
    for (let i = 0, len = moves.length; i < len; i++) {
      if (cleanMove === strippedSan(this._moveToSan(moves[i], moves))) {
        return moves[i];
      }
    }

    // the strict parser failed
    if (strict) {
      return null;
    }

    let piece = undefined;
    let matches = undefined;
    let from = undefined;
    let to = undefined;
    let promotion = undefined;

    /*
     * The default permissive (non-strict) parser allows the user to parse
     * non-standard chess notations. This parser is only run after the strict
     * Standard Algebraic Notation (SAN) parser has failed.
     *
     * When running the permissive parser, we'll run a regex to grab the piece, the
     * to/from square, and an optional promotion piece. This regex will
     * parse common non-standard notation like: Pe2-e4, Rc1c4, Qf3xf7,
     * f7f8q, b1c3
     *
     * NOTE: Some positions and moves may be ambiguous when using the permissive
     * parser. For example, in this position: 6k1/8/8/B7/8/8/8/BN4K1 w - - 0 1,
     * the move b1c3 may be interpreted as Nc3 or B1c3 (a disambiguated bishop
     * move). In these cases, the permissive parser will default to the most
     * basic interpretation (which is b1c3 parsing to Nc3).
     */

    let overlyDisambiguated = false;

    matches = cleanMove.match(
      /([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/
      //     piece         from              to       promotion
    );

    if (matches) {
      piece = matches[1];
      from = matches[2] as Square;
      to = matches[3] as Square;
      promotion = matches[4];

      if (from.length == 1) {
        overlyDisambiguated = true;
      }
    } else {
      /*
       * The [a-h]?[1-8]? portion of the regex below handles moves that may be
       * overly disambiguated (e.g. Nge7 is unnecessary and non-standard when
       * there is one legal knight move to e7). In this case, the value of
       * 'from' variable will be a rank or file, not a square.
       */

      matches = cleanMove.match(
        /([pnbrqkPNBRQK])?([a-h]?[1-8]?)x?-?([a-h][1-8])([qrbnQRBN])?/
      );

      if (matches) {
        piece = matches[1];
        from = matches[2] as Square;
        to = matches[3] as Square;
        promotion = matches[4];

        if (from.length == 1) {
          overlyDisambiguated = true;
        }
      }
    }

    pieceType = inferPieceType(cleanMove);
    moves = this._moves({
      legal: true,
      piece: piece ? (piece as PieceType) : pieceType,
    });

    if (!to) {
      return null;
    }

    for (let i = 0, len = moves.length; i < len; i++) {
      if (!from) {
        // if there is no from square, it could be just 'x' missing from a capture
        if (
          cleanMove ===
          strippedSan(this._moveToSan(moves[i], moves)).replace('x', '')
        ) {
          return moves[i];
        }
        // hand-compare move properties with the results from our permissive regex
      } else if (
        (!piece || piece.toLowerCase() == moves[i].piece) &&
        Ox88[from] == moves[i].from &&
        Ox88[to] == moves[i].to &&
        (!promotion || promotion.toLowerCase() == moves[i].promotion)
      ) {
        return moves[i];
      } else if (overlyDisambiguated) {
        /*
         * SPECIAL CASE: we parsed a move string that may have an unneeded
         * rank/file disambiguator (e.g. Nge7).  The 'from' variable will
         */

        const square = algebraic(moves[i].from);
        if (
          (!piece || piece.toLowerCase() == moves[i].piece) &&
          Ox88[to] == moves[i].to &&
          (from == square[0] || from == square[1]) &&
          (!promotion || promotion.toLowerCase() == moves[i].promotion)
        ) {
          return moves[i];
        }
      }
    }

    return null;
  }

  // pretty = external move object
  private _makePretty(
    uglyMove: InternalMove,
    originalString?: string
  ): PrettyMove {
    const { color, piece, from, to, flags, capture, promotion } = uglyMove;

    let prettyFlags = '';

    for (const flag in BITS) {
      if (BITS[flag] & flags) {
        prettyFlags += FLAGS[flag];
      }
    }

    const fromAlgebraic = algebraic(from);
    const toAlgebraic = algebraic(to);

    // this can be redone later, but for consistent order I am constructing the move funnily

    const move: Move = {
      color,
      from: fromAlgebraic,
      to: toAlgebraic,
      flags: prettyFlags,
      piece,
      umabiguousSymbol: uglyMove.unambiguousSymbol,
    };

    if (capture) {
      move.capture = capture;
    }
    if (promotion) {
      move.promotion = promotion;
      // move.lan += promotion;
    }

    const prettyMove: PrettyMove = {
      color: move.color,
      fromIndex: uglyMove.from,
      toIndex: uglyMove.to,
      from: move.from,
      to: move.to,
      flags: move.flags,
      piece: move.piece,
      uas: uglyMove.unambiguousSymbol,
      originalString,
    };

    if (move.capture) {
      prettyMove['capture'] = move.capture;
    }

    return prettyMove;
  }

  turn() {
    return this._turn;
  }

  squareColor(square: Square) {
    if (square in Ox88) {
      const sq = Ox88[square];
      return (rank(sq) + file(sq)) % 2 === 0 ? 'light' : 'dark';
    }

    return null;
  }

  history() {
    return this._history.map((h) => {
      return {
        ...this._makePretty(h.move, h.originalString),
        originalString: h.originalString,
      };
    });
  }
}
