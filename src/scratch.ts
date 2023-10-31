import {
    getGameWithMostMoves
  } from '../src/metrics/metrics';

// game being tested: https://lichess.org/jo73x9y8
const game = [
    {
      metadata: [],
      moves: '1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. c3 Bc5 5. cxd4 Nxd4 6. Nxd4 Bxd4 7. Qxd4 d6 8. Qxg7 Qf6 9. Qxf6 Nxf6 10. Bc4 Be6 11. Bxe6 fxe6 12. Nc3 O-O-O 13. O-O Kb8 14. Bg5 Rhf8 15. Rad1 Rd7 16. e5 dxe5 17. Bxf6 Rxd1 18. Rxd1 a6 19. Bxe5 b5 20. Rd7 b4 21. Na4 Kb7 22. Rxc7+ Kb8 23. Rxh7+ Kc8 24. Rc7+ Kd8 25. Rc6 Ke7 26. Rxa6 Rd8 27. Ra7+ Ke8 28. Kf1 Rd2 29. Ra8+ Kd7 30. Rb8 Rd5 31. Bg3 Ra5 32. b3 Rd5 33. Rb7+ Kc6 34. Rb6+ Kd7 35. Rd6+ Rxd6 36. Bxd6 Kxd6 37. Ke2 Kc6 38. Kd3 Kb5 39. Ke4 Kc6 40. h4 Kd7 41. g4 Ke7 42. h5 Kf7 43. Ke5 Kg7 44. f4 Kh6 45. Kxe6 Kg7 46. g5 Kh7 47. Kf6 Kh8 48. g6 Kg8 49. h6 Kh8 50. Kg5 Kg8 51. f5 Kh8 52. f6 Kg8 53. g7 Kh7 54. Kf5 Kg8 55. Ke6 Kh7 56. f7 Kg6 57. f8=Q Kh7 58. g8=Q# 1-0'
    }
  ];

  getGameWithMostMoves(game)
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
  });
