import { Chess } from '../cjsmin/src/chess';

const chess = new Chess();
chess.loadPgn('1. e4 e5 2. d4 exd4 3. Qxd4 Nc6 4. Qa4 Nf6 5. Nc3 d5 6. exd5 Qe7+ 7. Kd1 Bg4+ 8. Kd2 Nxd5 9. Nb5 Ncb4 10. c3 O-O-O 11. f3 Qe3+ 12. Kd1 Nxc3# 0-1');