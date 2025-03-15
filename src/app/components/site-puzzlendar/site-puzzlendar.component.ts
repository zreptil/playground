import {Component} from '@angular/core';
import {MaterialModule} from '@/material.module';
import {PuzzlendarService} from '@/_services/puzzlendar.service';
import {MessageService} from '@/_services/message.service';
import {ProgressComponent} from '@/components/progress/progress.component';
import {ProgressService} from '@/_services/progress.service';
import {DialogResultButton} from '@/_model/dialog-data';
import {PuzzlendarSolver} from '@/_services/puzzlendar.solver';
import {Utils} from '@/classes/utils';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';

@Component({
    selector: 'app-site-puzzlendar',
    imports: [
        MaterialModule,
        ProgressComponent
    ],
    templateUrl: './site-puzzlendar.component.html',
    styleUrl: './site-puzzlendar.component.scss'
})
export class SitePuzzlendarComponent {
  testDate = 1510;

  content = [
    ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'],
    ['Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    ['1', '2', '3', '4', '5', '6', '7'],
    ['8', '9', '10', '11', '12', '13', '14'],
    ['15', '16', '17', '18', '19', '20', '21'],
    ['22', '23', '24', '25', '26', '27', '28'],
    ['29', '30', '31']
  ];

  worker: Worker;

  srv = new PuzzlendarSolver();

  constructor(public ps: PuzzlendarService,
              public msg: MessageService,
              public progress: ProgressService) {
    setTimeout(() => this.clickTest(null, this.testDate));
  }

  get maxSolutions(): string {
    const keys = Object.keys(this.ps._solutions);
    let key: string;
    const v = keys.reduce((a, b) => {
      if (a < this.ps.solutionsFor(+b, true).length) {
        key = `${+b % 100}.${Math.floor(+b / 100)}`;
        return this.ps.solutionsFor(+b, true).length;
      }
      return a;
    }, -Infinity)
    return `${key}: ${v}`;
  }

  get minSolutions(): string {
    const keys = Object.keys(this.ps._solutions);
    let key: string;
    const v = keys.reduce((a, b) => {
      if (a > this.ps.solutionsFor(+b, true).length) {
        key = `${+b % 100}.${Math.floor(+b / 100)}`;
        return this.ps.solutionsFor(+b, true).length;
      }
      return a;
    }, Infinity)
    return `${key}: ${v}`;
  }

  get classForBoard(): string[] {
    const ret: string[] = [];
    if (!Utils.isEmpty(this.ps.boardString)) {
      ret.push('solution');
    }
    if (!this.ps.partsColored) {
      ret.push('monochrome');
    }
    return ret;
  }

  get classForState(): string[] {
    const ret: string[] = [];
    if (this.ps.isWorking) {
      ret.push('working');
    }
    return ret;
  }

  get msgSolve(): string {
    const check = this.ps.solutionsFor(this.ps.boardDate);
    if (check != null) {
      if (Array.isArray(check)) {
        return `${check.length + 1}. Lösung ermitteln`
      }
    }
    return 'Lösung ermitteln';
  }

  get msgSolution(): string {
    const check = this.ps.solutionsFor(this.ps.boardDate, true);
    if (check != null) {
      if (Array.isArray(check)) {
        const idx = check.findIndex((s: string) => s === this.ps.boardString);
        if (idx >= 0 && idx < check.length - 1) {
          return `${idx + 2}. Lösung`
        } else {
          return `1. Lösung`
        }
      }
    }
    return 'Lösung';
  }

  clickCell(evt: MouseEvent, x: number, y: number) {
    const firstLine = y < 2 ? 0 : 2;
    const lastLine = y < 2 ? 1 : 6;
    let v = this.ps.board[y][x];
    if (v < 0) {
      this.clickTest(evt, this.ps.boardDate, true)
      return;
    }
    if (v === 1119) {
      v = 0;
    } else {
      v = 9;
      for (let i = firstLine; i <= lastLine; i++) {
        for (let j = 0; j < 7; j++) {
          if (this.ps.board[i][j] === 9) {
            this.ps.board[i][j] = 0;
            break;
          }
        }
      }
    }
    this.ps.board[y][x] = v;
    this.ps.setBoard();
    this.ps.clearBoard();
  }

  clickClear(_evt: MouseEvent) {
    const d = Math.floor(this.ps.boardDate / 100);
    const m = this.ps.boardDate % 100;
    this.msg.confirm($localize`Sollen wirklich alle Lösungen für den ${d}.${m}. gelöscht werden?`).subscribe(result => {
      if (result?.btn === DialogResultButton.yes) {
        this.ps.setSolutionsFor(this.ps.boardDate, []);
      }
    })
  }

  clickSolve(_evt: MouseEvent, type: string) {
    this.ps.solve(type);
  }

  clickTest(_evt: MouseEvent, value: number | string, filterParts = false) {
    let ret: string;
    if (typeof value === 'string') {
      ret = value;
    } else {
      const src = this.ps.solutionsFor(value, filterParts) ?? [];
      const idx = src.findIndex((s: string) => s === this.ps.boardString);
      if (idx >= 0) {
        if (idx < src.length - 1) {
          ret = src[idx + 1];
        } else {
          ret = src[0];
        }
      } else {
        ret = src[0];
      }
    }
    if (ret != null) {
      this.ps.placeParts(ret);
    }
  }

  clickPart(evt: MouseEvent, key: string) {
    const idx = this.ps.solverParts.indexOf(key);
    if (idx >= 0) {
      this.ps.solverParts.splice(idx, 1);
    } else {
      this.ps.solverParts.push(key);
    }
    this.ps.setBoard();
  }

  classForPart(key: string): string[] {
    const ret: string[] = [];
    if (this.ps.solverParts.indexOf(key) >= 0) {
      ret.push('selected');
    }
    return ret;
  }

  cellInfo(x: number, y: number) {
    const ret: string[] = [];
    if (y > 1 && this.ps.boardDate != null) {
      const d = Math.floor(this.ps.boardDate / 100) * 100 + (+this.content[y]?.[x]);
      if (this.ps._solutions[d]?.indexOf('*') >= 0) {
        ret.push(`${this.ps.solutionsFor(d, this.ps.solverParts?.length > 0).length}`);
      }
    }
    return Utils.join(ret, '\n');
  }

  cellContent(x: number, y: number) {
    return this.content[y]?.[x];
  }

  classForSpacer(x: number, y: number, row: boolean): string[] {
    const ret: string[] = [row ? 'row' : 'col'];
    if (this.ps?.board == null) {
      return ret;
    }
    const check = this.ps.board[y][x];
    if (check < 1 || check > 8) {
      return ret;
    }
    if (row && x < this.ps.board[y].length - 1 && this.ps.board[y][x + 1] === check) {
      ret.push('filled');
      ret.push(`c${check}`);
    } else if (!row && y < this.ps.board.length - 1 && this.ps.board[y + 1][x] === check) {
      ret.push('filled');
      ret.push(`c${check}`);
    }
    return ret;
  }

  classForCell(x: number, y: number) {
    const ret: string[] = [];
    if (this.ps?.board == null) {
      return ret;
    }
    const cell = this.ps.board[y][x];
    ret.push(`c${cell}`);
    if (x === 0 || this.ps.board[y][x - 1] !== cell) {
      ret.push('left');
    }
    if (x === this.ps.board[y].length - 1 || this.ps.board[y][x + 1] !== cell) {
      ret.push('right');
    }
    if (y === 0 || this.ps.board[y - 1][x] !== cell) {
      ret.push('top');
    }
    if (y === this.ps.board.length - 1 || this.ps.board[y + 1][x] !== cell) {
      ret.push('bottom');
    }
    return ret;
  }

  toggleColored(evt: MatSlideToggleChange) {
    this.ps.partsColored = evt.checked;
  }
}
