import {Component} from '@angular/core';
import {MaterialModule} from '@/material.module';
import {PuzzlendarService} from '@/_services/puzzlendar.service';
import {MessageService} from '@/_services/message.service';
import {ProgressComponent} from '@/components/progress/progress.component';
import {ProgressService} from '@/_services/progress.service';

@Component({
  selector: 'app-site-puzzlendar',
  standalone: true,
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

  constructor(public ps: PuzzlendarService,
              public msg: MessageService,
              public progress: ProgressService) {
    setTimeout(() => this.clickTest(null, this.testDate));
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
    const check = this.ps.solutionsFor(this.ps.boardDate);
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

  clickCell(evt: MouseEvent, row: number[], idx: number) {
    if (row[idx] === 9 || row[idx] === 0) {
      row[idx] = 9 - row[idx];
      this.ps.setBoard();
    } else {
      this.ps.clearBoard();
    }
  }

  clickClear(_evt: MouseEvent) {
    if (this.msg.confirm($localize`Sollen wirklich alle Lösungen für den gelöscht werden?`)) {
      this.ps.boardDate
    }
  }

  clickSolve(_evt: MouseEvent, type: string) {
    this.ps.solve(type);
  }

  clickTest(_evt: MouseEvent, date: number) {
    const src = this.ps.solutionsFor(date) ?? [];
    let ret: string;
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
    if (ret != null) {
      this.ps.placeParts(ret);
    }
  }
}
