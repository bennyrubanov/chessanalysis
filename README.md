# Overview

Welcome! We (@EllAchE and @bennyrubanov) are chess amateurs who also have interests in statistics, programming and sillyness. This repo brings those interests together. Here, we find and visualize some of the sillier (and perhaps less useful) chess statistics no one has bothered to calculate before. This project is open source, so we encourage contributions and suggestions! 😊

# Methodology

## Data

Data is sourced from the public [Lichess games database](https://database.lichess.org/).

## Credits

We have taken advantage of some of the helpful methods in [chess.js](https://github.com/jhlywa/chess.js/blob/master/README.md) to save ourselves a little time.

## Definitions
- Unambiguous Piece (UAP): e.g. pawn that started on a2
- Ambiguous pieces: pawn, bishop, knight, rook, queen, king

## Edge Cases

Current implementation is **bolded** where multiple options exist:

### Kills/Deaths/Assists
- If two pieces simultaneously checkmate a king each is credited with 0.5 kills/mates (not currently implemented)
- A checkmate is considered a "death" for the king and a "kill" for the mating piece

### Distances

#### Knight
- **knight move counts as 2: one diagonal and one hor/vert**. An alternative would be to count as 3: 2 horizontal/vertical + 1 hor/vert
- To calculate when a knight "hops" a piece we do the following. 
  - A knight can take 2 paths to its destination, if either of those paths is clear we assume it takes the "easier path" and does not hop a piece.
  - If there is no clear path we count ALL pieces blocking both paths, then divide the aggregate by 2. There are two reasons for this:
    - We want deterministic outputs from processing games
    - We want to avoid selection bias.
    It would be possible to use a deterministic rule (i.e. short distance first when odd moves) to determine the knight's path, however that or similar decisions could introduce bias when considering common opening patterns. A randomness rule (i.e. generate a random number to choose the path) would avoid this but would lead to nondeterminisic results.

#### Bishop
- **Diagonal moves count as 1**. An alternative would be diagonal moves count as 2: 1 horizontal + 1 vertical

#### Castling
- Castling counts as a move for a rook as well as the king
- The distance a rook covers during a castle move is also tracked

### Promotions
- After an unambiguous piece is promoted:
  - It is treated as the new piece
  - **It is treated as the original piece (i.e. if the pawn that started the game on a2 is promoted to a Queen, it is still treated as the pawn on a2 for the purposes of calculating distance functions, etc)**

# Priority (& Silly) Questions to answer

Kills/Deaths/Assists 

thesis: beginners get forked by knights and lose a lot of high level pieces. Will be answered by KD ratio by piece value

- K/D ratios for each piece
  - KD ratio by piece value (where piece values are defined as: Pawn 1 point, Knight 3 points, Bishop 3 points, Rook 5 points, Queen 9 points)
  - KD ratio by number of pieces taken
- revenge kills (i.e. take back a piece immediately after it was taken)
- best kill streaks (i.e. one piece is the only one taking others for some time)
- which piece delivers checkmate most/least often, has the most checkmate assists, and the most hockey assists
- where do checkmates happen most/least often (what squares specifically)
- heat map of which squares are "battleground", i.e. have the most captures

Distances/Moves
- average distance each piece has traveled
  - furthest distance a piece has traveled in a single game
- average number of moves by piece
- the game with the furthest collective distance moved
- the game with the most moves played

Promotions
- how often a piece is promoted to different pieces (q, n, b, r)
- how often each unambiguous pawn promotes

Openings/Endings/Wins/Losses
- how often do games end with 3 fold repetition? Stalemate? Ties in general? Insufficient material? Loss on time? Lack of pawn advancement?
- top 5 most used/popular openings
  - number of times various openings (e.g. bongcloud 😁) are played ♙
- which side wins more often (white vs black)
  - percentage of games ending with white winning, black winning, and ties
- which side wins more often for each of the top 5 most used/popular openings

Dataset facts
- number of games analyzed
- average rating of players
- quantity of games played by time control category (e.g. bullet/blitz/rapid/classical)
- quantity of games played by time control quantity (e.g. 180+2, 1500+0, etc)
- quantity of games ended by termination type (e.g. "normal", "time forfeit", etc)
- player who played the most games in the dataset
- average rating diff in games played
- largest rating diff between players in games played

Miscellaneous
- most queens to appear in a game
- en passant count
- most pieces hopped over by a knight
- average pieces hopped by a knight
- number of games with queen side vs king side castling
- number of games without castling

### Extra Credit Questions to Answer

- what time people rage quit at different ELOs
- which piece is a "defender" for when checkmate within king capture range is possible
- different number of mistakes for each ELO
- heat map of squares sat on and visited by piece type
- furthest distance a single pawn has gone from it's original lane
- heat map of where each piece gets its kills, vs. its deaths
- at what move number in a chess game is a move played by fewer than 10% of the players who follow a particular opening or line?
- average piece lifetime
  - how many moves until a piece is captured on average
  - how much clock time until a piece is captured on average
- has a single piece ever covered the entire board in one game?
- how many pieces on average does a Queen take before it gets taken down

# Planned Roadmap Items
- Segment by ELO rating ranges
- Segment all relevant questions by ambiguous pieces and unambiguous pieces (e.g. pawn, bishop, knight, rook, queen, king) vs unambiguous pieces (e.g. pawn that started on a2)
- Segment by wins and losses
- Answer: which openings are most effective to learn by ELO rating? (find out which openings are most effective by ELO rating ranges)

Thanks for reading!
