import {Injectable} from '@angular/core';
import {MessageService} from '@/_services/message.service';
import {Utils} from '@/classes/utils';
import {ProgressService} from '@/_services/progress.service';
import {State, WorkerService} from '@/_services/worker.service';
import {BoardData, BoardType} from '@/_model/board-data';
import {PuzzlendarSolver} from '@/_services/puzzlendar.solver';

@Injectable({
  providedIn: 'root'
})
export class PuzzlendarService extends WorkerService {
  static LS_SOLUTIONS_KEY = 'solutions';
  static LS_DATE_KEY = 'date';
  static LS_SOLVERPARTS_KEY = 'solverparts-test';
  brd: BoardData;
  boardString: string;
  partString: string;
  solverParts: string[] = [];
  _solutions: { [key: string]: string[] };
  partsColored = true;
  showImmediate = false;
  srv: PuzzlendarSolver;

  constructor(public msg: MessageService,
              public progress: ProgressService) {
    super();
//    this.brd = new BoardData(BoardType.dragonfjord);
    this.brd = new BoardData(BoardType.pentomino);
    this.srv = new PuzzlendarSolver(this.brd);
    this.partString = this.brd.parts.reduce((a, b) => a + b.key, '');
    PuzzlendarService.LS_SOLUTIONS_KEY += '-' + this.brd.type + '-' + this.partString;
    PuzzlendarService.LS_DATE_KEY += '-' + this.brd.type + '-' + this.partString;
    let temp = JSON.parse(localStorage.getItem(PuzzlendarService.LS_SOLUTIONS_KEY) ?? '{}');
    this._solutions = {};
    for (const key of Object.keys(temp)) {
      if (!Array.isArray(temp[key])) {
        this._solutions[key] = [temp[key]];
      } else {
        this._solutions[key] = temp[key];
      }
    }
    this.setDateToBoard(+(localStorage.getItem(PuzzlendarService.LS_DATE_KEY)), this.brd);
    temp = localStorage.getItem(PuzzlendarService.LS_SOLVERPARTS_KEY) ?? '';
    this.solverParts = [];
    for (let i = 0; i < temp.length; i++) {
      this.solverParts.push(temp[i]);
    }
  }

  get isValid(): boolean {
    const count = this.brd.rows.reduce((acc, row) =>
      acc + row.reduce((acc, cell) => acc + (cell >= 0 && cell <= this.brd.parts.length ? 1 : 0), 0), 0);
    return count === this.brd.validCount;
  }

  readDateFromBoard() {
    let date = 0;
    for (let y = 0; y < this.brd.rows.length; y++) {
      for (let x = 0; x < this.brd.rows[y].length; x++) {
        if (this.brd.rows[y][x] === 99) {
          const key = `${x}${y}`;
          let idx = BoardData.weekdays(this.brd.type).indexOf(key);
          if (idx >= 0) {
            date += 10000 * idx;
          } else {
            idx = BoardData.months(this.brd.type).indexOf(key);
            if (idx >= 0) {
              date += 100 * (idx + 1);
            } else {
              idx = BoardData.days(this.brd.type).indexOf(key);
              if (idx >= 0) {
                date += idx + 1;
              }
            }
          }
        }
      }
    }
    this.brd.date = date;
  }

  solutionsFor(date: number, filterParts = false): readonly string[] {
    const list = this._solutions[date] ?? [];
    let ret = list.filter((s: string, idx: number) => s !== '*' && list.indexOf(s) === idx);
    if (filterParts && this.solverParts?.length > 0) {
      ret = ret.filter(s => s.startsWith(this.solverParts.join('')));
    }
    return ret;
  }

  finalizeSolution(date: number) {
    if (this._solutions[date].indexOf('*') < 0) {
      this._solutions[date].splice(0, 0, '*');
    }
  }

  saveSolution(data: any) {
    if (this.solutionsFor(data.brd.date) != null) {
      this.addSolution(data.brd.date, data.boardString);
    } else {
      this.setSolutionsFor(data.brd.date, [data.boardString]);
    }
    for (const key of Object.keys(this._solutions)) {
      this._solutions[key] = this._solutions[key]
        .filter((entry, idx) => this._solutions[key].indexOf(entry) === idx && !Utils.isEmpty(entry));
    }
    localStorage.setItem(PuzzlendarService.LS_SOLUTIONS_KEY, JSON.stringify(this._solutions));
    localStorage.setItem(PuzzlendarService.LS_DATE_KEY, `${data.brd.date}`);
  }

  addSolution(date: number, solution: string) {
    this._solutions[date] ??= [];
    this._solutions[date].push(solution);
  }

  setSolutionsFor(date: number, solutions: string[]) {
    this._solutions[date] = solutions;
  }

  workerMessage(data: any) {
    if (data.error != null) {
      this.msg.error(data.error);
    }
    switch (data.cmd) {
      case 'setBoard':
        this.brd = data.brd;
        this.readDateFromBoard();
        this.boardString = data.boardString;
        localStorage.setItem(PuzzlendarService.LS_SOLVERPARTS_KEY, this.solverParts.join(''));
        localStorage.setItem(PuzzlendarService.LS_DATE_KEY, `${data.brd.date}`);
        break;
      case 'solution':
        this.boardString = data.boardString;
        this.saveSolution(data);
        data.state = State.idle;
        break;
      case 'partialSolution':
        this.saveSolution(data);
        this.setProgressInfo(data.brd);
        if (this.progress.isStopped) {
          this.stop();
        }
        this.progress.text = `Gefundene Lösungen: ${this.solutionsFor(data.brd.date)?.length ?? 0}`;
        break;
      case 'progress':
        if (this.progress.isStopped) {
          this.stop();
        }
        this.progress.max = data.max ?? this.progress.max;
        this.progress.value = data.value ?? this.progress.value;
        this.progress.text = data.text ?? this.progress.text;
        this.progress.info = data.info ?? this.progress.info;
        break;
      case 'finalSolution':
        if (this._solutions[data.brd.date] != null) {
          this.finalizeSolution(data.brd.date);
          this.saveSolution(data);
        }
        this.solve('single');
        break;
      case 'daySolution':
      case 'oneperdaySolution':
        if (data.cmd === 'daySolution') {
          if (this._solutions[data.brd.date] != null) {
            this.finalizeSolution(data.brd.date);
          }
        }
        this.saveSolution(data);
        const d = BoardData.decodeDate(data.brd.date);
        d.d++;
        if (d.d === 32) {
          d.m++;
          d.d = 1;
        }
        if (d.m === 13) {
          if (data.brd.type === BoardType.zreptil) {
            d.w++;
            if (d.w < 7) {
              d.m = 1;
              d.w = 0;
            }
          }
        }
        if (d.m < 13) {
          this.setDateToBoard(d.w * 10000 + Math.max(0, d.m) * 100 + Math.max(0, d.d), data.brd);
          this.solve(data.cmd === 'daySolution' ? 'all' : 'oneperday');
        } else {
          data.state = State.idle;
        }
        break;
      case 'noSolutionForDay':
        data.state = State.idle;
        this.msg.info(`Der Teilesatz ${this.partString} ergibt keine Lösung für den ${data.brd.date % 100}.${Math.floor(data.brd.date / 100)}.`);
        break;
    }
    if (data.state != null) {
      this.state = data.state;
      if (this.isIdle) {
        this.progress.clear();
      }
    }
  }

  setDateToBoard(date: number, src: BoardData) {
    this.brd.date = date;
    const d = BoardData.decodeDate(this.brd.date);
    const wPos = BoardData.weekdays(this.brd.type)[d.w];
    const mPos = BoardData.months(this.brd.type)[d.m - 1];
    const dPos = BoardData.days(this.brd.type)[d.d - 1];
    this.brd.rows = src.rows.map((row: number[], y: number) =>
      row.map((v, x) => {
        const check = `${x}${y}`;
        if (check === wPos || check === mPos || check === dPos) {
          return 99;
        }
        return v === 99 ? 0 : v;
      }));
  }

  setBoard() {
    this.postMessage({cmd: 'setBoard', brd: this.brd});
  }

  showSolution(data: any) {
    if (Utils.isEmpty(data.boardString)) {
      this.state = State.idle;
      return;
    }
    this.msg.info(['Ermittelte Lösung', this.boardString.toUpperCase()])
      .subscribe({
        next: _result => {
          this.brd = data.brd;
          this.saveSolution(data);
          this.state = State.idle;
        }
      });
  }

  clearBoard(brd = this.brd): void {
    this.postMessage({cmd: 'clearBoard', brd: brd});
  }

  placeParts(partKeys: string, brd = this.brd) {
    this.postMessage({cmd: 'placeParts', brd: brd, partKeys: partKeys});
  }

  solve(type: string): void {
    if (!this.isValid) {
      this.msg.info('Die Auswahl der Felder ist ungültig');
      return;
    }
    this.progress.init({
      progressPanelBack: '#a0a0ff',
      progressPanelFore: '#00000080',
      progressBarColor: 'aqua',
      mayCancel: true
    });
    this.progress.max = 8!;
    this.progress.value = 0;
    this.progress.showCurrent = true;
    this.setProgressInfo(this.brd);
    this.progress.text = `Gefundene Lösungen: ${this.solutionsFor(this.brd.date)?.length ?? 0}`;
    let found = this._solutions[this.brd.date] ?? [];
    // switch (type) {
    //   case 'single':
    //     found = [this.boardString];
    //     break;
    // }
    this.postMessage({cmd: `solve-${type}`, brd: this.brd, alreadyFound: found});
  }

  setProgressInfo(board: BoardData) {
    const date = BoardData.decodeDate(board.date);
    switch (board.type) {
      case BoardType.dragonfjord:
        this.progress.info = `${date.d}.${Math.floor(date.m)}.`;
        break;
      case BoardType.zreptil:
        this.progress.info = `${BoardData.weekdayNameFor(date.w)}, ${date.d}.${Math.floor(date.m)}`;
        break;
    }
  }

  toggleCell(x: number, y: number) {
    const d = BoardData.decodeDate(this.brd.date);
    const check = `${x}${y}`;
    let idx = BoardData.weekdays(this.brd.type).indexOf(check);
    if (idx >= 0) {
      d.w = idx;
    } else {
      idx = BoardData.months(this.brd.type).indexOf(check);
      if (idx >= 0) {
        d.m = idx + 1;
      } else {
        idx = BoardData.days(this.brd.type).indexOf(check);
        if (idx >= 0) {
          d.d = idx + 1;
        }
      }
    }
    const date = d.w * 10000 + Math.max(d.m, 1) * 100 + Math.max(d.d, 1);
    this.setDateToBoard(date, this.brd);
    this.setBoard();
  }
}
