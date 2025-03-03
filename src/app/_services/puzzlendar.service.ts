import {Injectable} from '@angular/core';
import {MessageService} from '@/_services/message.service';
import {Utils} from '@/classes/utils';
import {ProgressService} from '@/_services/progress.service';
import {State, WorkerService} from '@/_services/worker.service';

@Injectable({
  providedIn: 'root'
})
export class PuzzlendarService extends WorkerService {
  static LS_SOLUTIONS_KEY = 'solutions';
  static LS_DATE_KEY = 'date';
  board = [
    [0, 0, 0, 0, 0, 0, -1],
    [0, 0, 0, 0, 0, 0, -1],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, -1, -1, -1, -1]
  ];
  boardString: string;
  boardDate: number;
  _solutions: { [key: string]: string[] };

  constructor(public msg: MessageService,
              public progress: ProgressService) {
    super();
    const temp = JSON.parse(localStorage.getItem(PuzzlendarService.LS_SOLUTIONS_KEY) ?? '{}');
    this._solutions = {};
    for (const key of Object.keys(temp)) {
      if (!Array.isArray(temp[key])) {
        this._solutions[key] = [temp[key]];
      } else {
        this._solutions[key] = temp[key];
      }
    }
    this.setDateToBoard(+(localStorage.getItem(PuzzlendarService.LS_DATE_KEY) ?? 101), this.board);
  }

  get isValid(): boolean {
    const count = this.board.reduce((acc, row) =>
      acc + row.reduce((acc, cell) => acc + (cell >= 0 && cell <= 8 ? 1 : 0), 0), 0);
    return count === 41;
  }

  solutionsFor(date: number): readonly string[] {
    return (this._solutions[date] ?? []).filter((s: string) => s !== '*');
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
        this.board = data.board;
        this.boardString = data.boardString;
        this.boardDate = data.date;
        break;
      case 'solution':
        this.boardString = data.boardString;
        this.progress.clear();
        this.showSolution(data);
        break;
      case 'partialSolution':
        this.boardDate = data.date;
        this.saveSolution(data);
        this.progress.info = `${data.date % 100}.${Math.floor(data.date / 100)}.`;
        this.progress.text = `Gefundene Lösungen: ${this.solutionsFor(data.date)?.length ?? 0}`;
        break;
      case 'progress':
        this.progress.max = data.max ?? this.progress.max;
        this.progress.value = data.value ?? this.progress.value;
        this.progress.text = data.text ?? this.progress.text;
        this.progress.info = data.info ?? this.progress.info;
        if (this.progress.isStopped) {
          this.stop();
        }
        break;
      case 'finalSolution':
        this.solve('single');
        break;
      case 'daySolution':
        this.boardDate = data.date;
        this.saveSolution(data);
        let m = Math.floor(data.date / 100);
        let d = data.date % 100;
        d++;
        if (d === 32) {
          m++;
          d = 1;
        }
        if (m < 13) {
          this.setDateToBoard(m * 100 + d, data.board);
          this.solve('all');
        }
        break;
    }
    if (data.state != null) {
      this.state = data.state;
      if (this.isIdle) {
        this.progress.clear();
      }
    }
  }

  setDateToBoard(date: number, src: number[][]) {
    this.boardDate = date;
    let m = Math.floor(date / 100);
    let d = date % 100;
    const mx = (m - 1) % 6;
    const my = Math.floor((m - 1) / 6);
    const dx = (d - 1) % 7;
    const dy = Math.floor((d - 1) / 7) + 2;
    this.board = src.map((row: number[], y: number) =>
      row.map((v, x) => {
        if ((x === dx && y === dy) || (x === mx && y === my)) {
          return 9;
        }
        return v === 9 ? 0 : v;
      }));
  }

  setBoard() {
    this.postMessage({cmd: 'setBoard', board: this.board});
  }

  saveSolution(data: any) {
    if (this.solutionsFor(data.date) != null) {
      this.addSolution(data.date, data.boardString);
    } else {
      this.setSolutionsFor(data.date, [data.boardString]);
    }
    localStorage.setItem(PuzzlendarService.LS_SOLUTIONS_KEY, JSON.stringify(this._solutions));
    localStorage.setItem(PuzzlendarService.LS_DATE_KEY, `${this.boardDate}`);
  }

  showSolution(data: any) {
    if (Utils.isEmpty(data.boardString)) {
      this.state = State.idle;
      return;
    }
    this.msg.info(['Ermittelte Lösung', this.boardString.toUpperCase()])
      .subscribe({
        next: _result => {
          this.board = data.board;
          this.saveSolution(data);
          this.state = State.idle;
        }
      });
  }

  clearBoard(board = this.board): void {
    this.postMessage({cmd: 'clearBoard', board: board});
  }

  placeParts(partKeys: string, board = this.board) {
    this.postMessage({cmd: 'placeParts', board: board, partKeys: partKeys});
  }

  solve(type: string): void {
    if (!this.isValid) {
      this.msg.info('Es müssen genau zwei Felder ausgewählt sein');
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
    this.progress.info = `${this.boardDate % 100}.${Math.floor(this.boardDate / 100)}.`;
    this.progress.text = `Gefundene Lösungen: ${this.solutionsFor(this.boardDate)?.length ?? 0}`;
    this.postMessage({cmd: `solve-${type}`, board: this.board, found: this.solutionsFor(this.boardDate)});
  }
}
