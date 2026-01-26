import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {MaterialModule} from '@/material.module';
import {PuzzlendarService} from '@/_services/puzzlendar.service';
import {MessageService} from '@/_services/message.service';
import {ProgressComponent} from '@/components/progress/progress.component';
import {ProgressService} from '@/_services/progress.service';
import {DialogResultButton} from '@/_model/dialog-data';
import {Utils} from '@/classes/utils';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {BoardData} from '@/_model/board-data';
import {FormsModule} from '@angular/forms';
import {GLOBALS} from '@/_services/globals.service';

@Component({
  selector: 'app-site-puzzlendar',
  imports: [
    MaterialModule,
    ProgressComponent,
    FormsModule
  ],
  templateUrl: './site-puzzlendar.component.html',
  styleUrl: './site-puzzlendar.component.scss'
})
export class SitePuzzlendarComponent implements AfterViewInit, OnDestroy {
  testDate = 1510;
  orientList = [
    {label: 'Vorderseite', value: 0},
    {label: 'Rückseite', value: 1}
  ];
  colorList = [
    {label: 'Einfarbig', value: 0},
    {label: 'Bunt', value: 1},
    {label: 'Vorder/Rückseite', value: 2},
  ]
  animationSync: any;

  constructor(public ps: PuzzlendarService,
              public msg: MessageService,
              public progress: ProgressService) {
    // setTimeout(() => this.clickTest(null, this.testDate));
    ps.filterOrientation = this.orientList.map(e => e.value);
    ps.showColors = 1;
  }

  get maxSolutions(): string {
    const keys = Object.keys(this.ps._solutions);
    let key: string;
    const v = keys.reduce((a, b) => {
      if (a < this.ps.solutionsFor(+b, true).length) {
        key = this.solutionString(+b);
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
        key = this.solutionString(+b);
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
    switch (this.ps.showColors) {
      case 0:
        ret.push('monochrome');
        break;
      case 2:
        ret.push('frontback');
        break;
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

  get hasSolutions() {
    return this.ps.solutionsFor(this.ps.brd?.date).length > 0;
  }

  get hasStar() {
    return (this.ps._solutions[this.ps?.brd?.date] ?? [])?.indexOf('*') >= 0;
  }

  ngOnDestroy() {
    this.animationSync?.free(); // optional: Synchronisation beenden
  }

  ngAfterViewInit() {
    if (GLOBALS.env?.urlParams?.puzzlendar === 'next') {
      setTimeout(() => {
        const date = Utils.addDateDays(new Date(), 1);
        const m = date.getMonth() + 1;
        const d = date.getDate();
        const w = Utils.getDow(date);
        this.ps.brd.date = w * 10000 + m * 100 + d;
        if (this.ps._solutions[this.ps.brd.date][0] !== '*') {
          this.clickSolve(null, 'day');
        }
      });
    }
  }

  onOrientChange(evt: any) {
    if (this.ps.filterOrientation.length === 0) {
      this.ps.filterOrientation = [evt.source.value];
    }
  }

  solutionString(key: number): string {
    const wd = BoardData.weekdayNameFor(Math.floor(+key / 10000));
    const d = Math.floor((+key % 10000) / 100);
    const m = +key % 100;
    return `${wd}-${m}.${d}`;
  }

  clickCell(evt: MouseEvent, x: number, y: number) {
    let v = this.ps.brd.rows[y][x];
    if (v < 0) {
      this.clickTest(evt, this.ps.brd.date, true);
      return;
    }
    this.ps.toggleCell(x, y);
    this.ps.clearBoard();
    if (this.ps.showImmediate) {
      this.clickTest(evt, this.ps.brd.date, true);
    }
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
    this.ps.solverParts = [];
    this.ps.solve(type);
  }

  clickTest(_evt: MouseEvent, value: number | string, filterParts = false) {
    const save = this.ps.showColors;
    if (this.ps.filterOrientation.length === 2) {
      this.ps.showColors = 0;
    }
    setTimeout(() => {
      this.setParts(this.ps.boardString, value, filterParts);
      this.ps.showColors = save;
    });
  }

  setParts(lastBoard: string, value: number | string, filterParts: boolean) {
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
      if (this.ps.filterOrientation.length === 1) {
        this.ps.afterSetBoard = () => {
          if (this.ps.boardString !== lastBoard) {
            this.ps.afterSetBoard = null;
            let tryNext = false;
            this.ps.brd.parts.forEach((part) => {
              if (!this.ps.isPartSymmetric(part)) {
                switch (this.ps.filterOrientation[0]) {
                  case 0:
                    if (part.mod >= 4) {
                      tryNext = true;
                    }
                    break;
                  case 1:
                    if (part.mod < 4) {
                      tryNext = true;
                    }
                    break;
                }
              }
            });
            if (tryNext) {
              if (lastBoard == null) {
                lastBoard = this.ps.boardString;
              }
              this.setParts(lastBoard, value, filterParts);
            }
          } else {
            this.msg.info(`Es gibt keine Lösung, bei der nur die ${this.orientList[this.ps.filterOrientation[0]].label} der Teile zu sehen ist`);
          }
        };
      }
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
      const count = this.ps.solutionsFor(key, this.ps.solverParts?.length > 0).length;
      if (count > 0) {
        ret.push(`${count}${this.ps._solutions[key]?.indexOf('*') >= 0 ? '*' : ''}`);
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
    if (cell > 0) {
      const part = this.ps.brd.parts[cell - 1];
      if (part != null) {
        if (part.mod >= 4) {
          ret.push('back');
        }
        if (this.ps.isPartSymmetric(part)) {
          if (this.ps.filterOrientation.length === 2) {
            ret.push('animate');
          } else {
            switch (this.ps.filterOrientation?.[0]) {
              case 1:
                ret.push('back');
                break;
            }
          }
        }
      }
    }
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

  toggleImmediate(evt: MatSlideToggleChange) {
    this.ps.showImmediate = evt.checked;
  }

  toggleAssetLoad(evt: MatSlideToggleChange) {
    this.ps.init(evt.checked);
  }

  classForOrient(orient: any) {
    return `orient${orient.value}`;
  }
}
