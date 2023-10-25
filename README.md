# Overview

Welcome! Myself (@EllAchE) and @bennyrubanov are chess amateurs who also have interests in statistics, programming and entertainment. All of those things are coming together in this repo where we find and visualize some of the more entertaining (though perhaps less useful) chess statistics no one has bothered to calculate before! This project is open source, we encourage your contribution and suggestions!

# Methodology

### Data

Data is sourced from the public [Lichess games database](https://database.lichess.org/).

### Credits

We have taken advantage of some of the helpful methods in [chess.js](https://github.com/jhlywa/chess.js/blob/master/README.md) to save ourselves a little time.

### Edge Cases

- After a piece is promoted:
  - It is treated as the new piece
  - It is treated as the original piece (i.e. if the pawn that started the game on a2 is promoted to a Queen, it is still treated as the pawn on a2 for the purposes of calculating distance functions, etc)
- If two pieces simulatenously checkmate a king each is credited with 0.5 kills/mates
- A checkmate is considered a "death" for the king
- When a knight "hops" its path is chosen based on if the current move is even or odd, i.e. two squares first if even, one if odd (This is done to ensure consistency in metrics across runs)
- For calculating distances, here are separate ways to interpret move distances:
  - Bishops
    - Diagonal moves count as 1
    - Diagonal moves count as 2 (1 horizontal, 1 vertical)
  - Knights
    - knight move counts as 3: 2 horizontal/vertical + 1 hor/vert
    - knight move counts as 2: one diagonal and one horizontal

# Questions to answer

- K/D ratio which piece takes another piece the most
  - thesis: beginners get forked by knights and lose a lot of high level pieces
  - do it by piece value OR number of pieces taken (checkmate = 1, scenarios where two pieces mate at same time is assist)
  - how many pieces does a Queen take before it gets taken down
  - overall KD ratio
  - Revenge kills (i.e. take back a piece immediately after it was taken)
- best kill streaks (i.e. one piece is the only one taking others for some time)
- average distance each piece has traveled
  - furthest distance a piece has traveled in a game
- average number of moves by piece
- The game with the furthest collective distance moved
- Which piece delivers checkmate most/least often
- Which piece has the most checkmate assists, and which piece has the most hockey assists
- How often do games end with 3 fold repetition? Stalemate? Insufficient material? Loss on time? Lack of pawn advancement?
- number of times various openings (bongcloud 😁) is played ♙
- Most pieces hopped over by a knight
- Average pieces hopped by a knight
- Which side wins more often (white vs black)
- Which side wins more often for each of the top 5 most used/popular openings
- The game with the most moves played

## Extra Credit

- what time people rage quit at different ELOs
- Which piece is a "defender" for when checkmate within king capture range is possible
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
- number of games with queen side vs king side castling

I'm thinking we get it working without elo segmentation, if it's fast enough we can just repeat the analysis with elo filters

# Dataset

There are 121332 games in the test dataset
