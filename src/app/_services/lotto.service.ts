import {Injectable} from '@angular/core';
import {GLOBALS} from '@/_services/globals.service';

export class LottoData {
  id: number;
  date: number;
  numbers: number[];
  super: number;
}

export class LottoFrequency {
  max: number = -1;
  min: number = 100000000;
  numbers: any = {};
}

@Injectable({
  providedIn: 'root'
})
export class LottoService {
  data: LottoData[];
  frequency: LottoFrequency = new LottoFrequency();

  sources: any = {
    lottoNumberArchive: {
      url: 'https://raw.githubusercontent.com/JohannesFriedrich/LottoNumberArchive/refs/heads/master/Lottonumbers_complete.json',
      convert: (item: any) => {
        const ret = new LottoData();
        ret.id = item.id;
        ret.numbers = item.Lottozahl;
        ret.super = item.Superzahl;
        ret.date = +(item.date.substring(6, 10) + item.date.substring(3, 5) + item.date.substring(0, 2));
        return ret;
      }
    }
  }

  constructor() {
    this.readData('lottoNumberArchive');
  }

  calculate(numbers?: number[]): any {
    const ret = new LottoFrequency();
    numbers ??= [];
    const list = this.data?.filter(d => d.date >= GLOBALS.siteConfig.lottoDate) ?? [];
    for (let i = 1; i <= 49; i++) {
      let checkList = list.filter(d =>
        d.numbers.includes(i)
      );
      for (const number of numbers) {
        checkList = checkList.filter(d =>
          d.numbers.includes(number)
        );
      }
      ret.numbers[i] = checkList.length;
      if (!numbers.includes(i)) {
        if (ret.numbers[i] > ret.max) {
          ret.max = ret.numbers[i];
        }
        if (ret.numbers[i] < ret.min) {
          ret.min = ret.numbers[i];
        }
      }
    }
    return ret;
  }

  private readData(key: string) {
    const src = this.sources[key];
    GLOBALS.requestJson(src.url).then(response => {
      this.data = response?.data?.map((item: any) => {
        return src.convert(item);
      });
      this.frequency = this.calculate();
    });
  }
}

