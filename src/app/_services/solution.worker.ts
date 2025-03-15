/// <reference lib="webworker" />
import {PuzzlendarSolver} from '@/_services/puzzlendar.solver';

addEventListener('message', ({data}) => {
  try {
    const srv = new PuzzlendarSolver();
    srv.board = data.board ?? srv.board;
    switch (data.cmd) {
      case 'clearBoard':
        srv.clearBoard();
        postMessage({cmd: 'setBoard', ...srv.boardData, state: 0});
        break;
      case 'setBoard':
        postMessage({cmd: 'setBoard', ...srv.boardData, state: 0});
        break;
      case 'placeParts':
        srv.placeParts(data.partKeys, data.board);
        postMessage({cmd: 'setBoard', ...srv.boardData, state: 0});
        break;
      case 'solve-single':
      case 'solve-all':
      case 'solve-day':
      case 'solve-oneperday':
        if (srv.solve(data.alreadyFound, data.cmd === 'solve-single' ? data.boardString : null, data.cmd)) {
          if (data.cmd === 'solve-single ' || data.cmd === 'solve-day') {
            postMessage({cmd: 'solution', ...srv.boardData});
          }
        } else {
          postMessage({error: `Es müssen genau zwei Felder ausgewählt sein`, state: 0});
        }
        break;
      default:
        postMessage({error: `Fehlerhafter Workeraufruf: cmd "${data.cmd}" unbekannt`, state: 0});
        break;
    }
  } catch (ex) {
    console.error(ex);
  }
});
