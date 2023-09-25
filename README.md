# Overview

Welcome! Myself (@EllAchE) and @bennyrubanov are chess amateurs who also have interests in statistics, programming and entertainment. All of those things are coming together in this repo where we find and visualize some of the more entertaining (though perhaps less useful) chess statistics no one has bothered to calculate before! This project 

# Methodology

Data is sourced from the public [Lichess games database](https://database.lichess.org/). We have also taken advantage of some of the helpful methods written by the [chess.js](https://github.com/jhlywa/chess.js/blob/master/README.md) community to save ourselves a little time. 

### Questions to answer
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

### Extra Credit
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
- How many games have no castling?

I'm thinking we get it working without elo segmentation, if it's fast enough we can just repeat the analysis with elo filters

### Edge Cases

- After a piece is promoted, it is treated as that piece. It is not considered a kill

# Notes

- No standard deviation
