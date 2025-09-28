import {Component} from '@angular/core';
import {LottoService} from '@/_services/lotto.service';
// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
// tslint:disable-next-line:no-duplicate-imports
import * as _moment from 'moment';
import {default as _rollupMoment} from 'moment';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {Utils} from '@/classes/utils';
import {DatepickerPeriod} from '@/_model/datepicker-period';

const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-site-lotto',
  templateUrl: './site-lotto.component.html',
  styleUrls: ['./site-lotto.component.scss'],
  standalone: false
})
export class SiteLottoComponent {
  listTitle = ['gesamt', 'Mittwoch', 'Samstag'];
  listRows: any[] = [{
    title: 'Ziehungen',
    count: (row: number, day: number): number => this.list(day)?.length
  }, {
    title: '1 richtiges',
    count: (row: number, day: number): number => this.hits(1, day)
  }, {
    title: '2 richtige',
    count: (row: number, day: number): number => this.hits(2, day)
  }, {
    title: '3 richtige',
    count: (row: number, day: number): number => this.hits(3, day)
  }, {
    title: '4 richtige',
    count: (row: number, day: number): number => this.hits(4, day)
  }, {
    title: '5 richtige',
    count: (row: number, day: number): number => this.hits(5, day)
  }, {
    title: '6 richtige',
    count: (row: number, day: number): number => this.hits(6, day)
  }];
  scheine = [[9, 13, 16, 27, 32, 36], [3, 15, 29, 33, 35, 47]];

  constructor(public ls: LottoService,
              public globals: GlobalsService) {
    const date = GLOBALS.siteConfig.lottoDate ?? Utils.fmtDate(new Date(), 'yyyyMMdd');
    this.period = new DatepickerPeriod(`${date}|${date}|3months|1|+++++++}`);
  }

  _period: DatepickerPeriod = new DatepickerPeriod();

  get period(): DatepickerPeriod {
    return this._period;
  }

  set period(value: DatepickerPeriod) {
    this._period = value;
    GLOBALS.siteConfig.lottoDate = +Utils.fmtDate(value.start, 'yyyyMMdd');
  }

  hits(count: number, day: number) {
    const list = this.list(day) ?? [];
    let ret = 0;
    for (const data of list) {
      for (const schein of this.scheine) {
        let cnt = 0;
        for (const zahl of schein) {
          if (data.numbers.includes(zahl)) {
            cnt++;
          }
        }
        if (cnt === count) {
          ret++;
        }
      }
    }
    return ret;
  }

  list(day: number) {
    return this.ls?.data?.filter(d => d.date >= GLOBALS.siteConfig.lottoDate
      && (day === -1 || Utils.getDate(d.date).getDay() === day));
  }

  changeSchein(numbers: number[], idx: number) {
    this.scheine[idx] = numbers;
  }
}
