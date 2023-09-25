# Questions

### Priority List
- K/D ratio which piece takes another piece the most
    - thesis: beginners get forked by knights and lose a lot of high level pieces
    - do it by piece value OR number of pieces taken (checkmate = 1, scenarios where two pieces mate at same time is assist)
    - how many pieces does a Queen take before it gets taken down
    - overall KD ratio
    - Revenge kills (i.e. take back a piece immediately after it was taken)
- average distance each piece has traveled
    - furthest distance a piece has traveled in a game
- average number of moves each game for a particular piece type
- How many turns pieces have been moved
- Which piece delivers checkmate most/least often
- Checkmate assists (and maybe hockey assists)
- How often do games end with 3 fold repetition? Stalemate? Insufficient material? Loss on time? Lack of pawn advancement?
- number of times various openings (bongcloud 😁) is played ♙

### Secondary priorities
- what time people rage quit at different ELOs
- most queens to appear in a game
- how often a piece is promoted to different pieces
- which openings at different levels
- different number of mistakes for each ELO
- Has a single piece ever covered the entire board?
- Heat map of squares sat on and visited by piece type
- En passant count
- Furthest distance a single pawn has gone from it's original lane
- Heat map of which squares are "battleground", i.e. have the most captures
- Heat map of where each piece gets its kills, vs. its deaths

I'm thinking we get it working without elo segmentation, if it's fast enough we can just repeat the analysis with elo filters

## Requirements

- Segment by ELO

## Stats

- How many games have no castling?
