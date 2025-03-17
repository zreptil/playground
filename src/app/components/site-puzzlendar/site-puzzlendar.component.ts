import {Component} from '@angular/core';
import {MaterialModule} from '@/material.module';
import {PuzzlendarService} from '@/_services/puzzlendar.service';
import {MessageService} from '@/_services/message.service';
import {ProgressComponent} from '@/components/progress/progress.component';
import {ProgressService} from '@/_services/progress.service';
import {DialogResultButton} from '@/_model/dialog-data';
import {Utils} from '@/classes/utils';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {BoardData} from '@/_model/board-data';

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
      if (this.ps.showImmediate) {
        ret.push('solutionShow');
      } else {
        ret.push('solution');
      }
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
    const check = this.ps.solutionsFor(this.ps.brd.date);
    if (check != null) {
      if (Array.isArray(check)) {
        return `${check.length + 1}. Lösung ermitteln`
      }
    }
    return 'Lösung ermitteln';
  }

  get msgSolution(): string {
    const check = this.ps.solutionsFor(this.ps.brd.date, true);
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
    let v = this.ps.brd.rows[y][x];
    if (v < 0) {
      this.clickTest(evt, this.ps.brd.date, true)
      return;
    }
    this.ps.toggleCell(x, y);
    this.ps.clearBoard();
  }

  clickClear(_evt: MouseEvent) {
    const d = BoardData.decodeDate(this.ps.brd.date);
    this.msg.confirm($localize`Sollen wirklich alle Lösungen für den ${d.d}.${d.m}. gelöscht werden?`).subscribe(result => {
      if (result?.btn === DialogResultButton.yes) {
        this.ps.setSolutionsFor(this.ps.brd.date, []);
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
    if (this.ps.showImmediate) {
      this.clickTest(evt, this.ps.brd?.date, true);
    }
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
    const idx = BoardData.days(this.ps.brd.type).indexOf(`${x}${y}`);
    if (idx >= 0) {
      const d = BoardData.decodeDate(this.ps.brd.date);
      const key = d.w * 10000 + d.m * 100 + idx + 1;
      if (this.ps._solutions[key]?.indexOf('*') >= 0) {
        ret.push(`${this.ps.solutionsFor(key, this.ps.solverParts?.length > 0).length}`);
      }
    }
    return Utils.join(ret, '\n');
  }

  cellContent(x: number, y: number) {
    return BoardData.labelFor(this.ps.brd.type, x, y);
  }

  classForSpacer(x: number, y: number, row: boolean): string[] {
    const ret: string[] = [row ? 'row' : 'col'];
    if (this.ps?.brd == null) {
      return ret;
    }
    const check = this.ps.brd.rows[y][x];
    if (check < 1 || check > 8) {
      return ret;
    }
    if (row && x < this.ps.brd.rows[y].length - 1 && this.ps.brd.rows[y][x + 1] === check) {
      ret.push('filled');
      ret.push(`c${check}`);
    } else if (!row && y < this.ps.brd.rows.length - 1 && this.ps.brd.rows[y + 1][x] === check) {
      ret.push('filled');
      ret.push(`c${check}`);
    }
    return ret;
  }

  classForCell(x: number, y: number) {
    const ret: string[] = [];
    if (this.ps?.brd == null) {
      return ret;
    }
    const cell = this.ps.brd.rows[y][x];
    ret.push(`c${cell}`);
    if (x === 0 || this.ps.brd.rows[y][x - 1] !== cell) {
      ret.push('left');
    }
    if (x === this.ps.brd.rows[y].length - 1 || this.ps.brd.rows[y][x + 1] !== cell) {
      ret.push('right');
    }
    if (y === 0 || this.ps.brd.rows[y - 1][x] !== cell) {
      ret.push('top');
    }
    if (y === this.ps.brd.rows.length - 1 || this.ps.brd.rows[y + 1][x] !== cell) {
      ret.push('bottom');
    }
    return ret;
  }

  toggleColored(evt: MatSlideToggleChange) {
    this.ps.partsColored = evt.checked;
  }

  toggleImmediate(evt: MatSlideToggleChange) {
    this.ps.showImmediate = evt.checked;
  }
}
