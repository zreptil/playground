import {Injectable} from '@angular/core';
import {GLOBALS} from '@/_services/globals.service';

export class LottoData {
  id: number;
  date: number;
  numbers: number[];
  super: number;
}

@Injectable({
  providedIn: 'root'
})
export class LottoService {
  data: LottoData[];
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

  private readData(key: string) {
    const src = this.sources[key];
    GLOBALS.requestJson(src.url).then(response => {
      this.data = response?.data?.map((item: any) => {
        return src.convert(item);
      });
      // console.log(`LottoService ${key}`, this.data);
    });
  }
}

