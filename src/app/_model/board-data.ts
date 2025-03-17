import {PartData} from '@/_model/part-data';

// https://www.puzzleadaysolver.com/solver
// https://www.dragonfjord.com/product/a-puzzle-a-day/
export enum BoardType {
  dragonfjord,
  zreptil,
  pentomino
}

export class BoardData {
  rows: number[][];
  validCount: number;
  date: number;
  parts: PartData[];
  maxX: number;
  maxY: number;

  constructor(public type: BoardType) {
    switch (type) {
      case BoardType.dragonfjord:
        this.rows = [
          [0, 0, 0, 0, 0, 0, -1],
          [0, 0, 0, 0, 0, 0, -1],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, -1, -1, -1, -1]
        ];
        this.validCount = 41;
        this.parts = [
          new PartData('u', 1, [[0, 1], [1, 1], [2, 1], [2, 0]], [4, 5, 6, 7]),
          new PartData('n', 2, [[0, 1], [0, 2], [-1, 2], [-1, 3]]),
//    new PartData('f', 2, [[1, 0], [2, 0], [1, -1], [2, 1]]),
          new PartData('z', 3, [[-1, 0], [-1, 1], [-1, 2], [-2, 2]], [2, 3, 6, 7]),
          new PartData('v', 4, [[0, 1], [0, 2], [1, 2], [2, 2]], [4, 5, 6, 7]),
          new PartData('m', 5, [[1, 0], [0, 1], [1, 1], [0, 2], [1, 2]], [2, 3, 4, 5, 6, 7]),
          new PartData('y', 6, [[1, 0], [2, 0], [3, 0], [1, 1]]),
//    new PartData('x', 6, [[1, 0], [0, 1], [-1, 0], [0, -1]]),
          new PartData('l', 7, [[0, 1], [0, 2], [0, 3], [1, 3]]),
//    new PartData('t', 7, [[0, 1], [0, 2], [1, 1], [2, 1]]),
          new PartData('p', 8, [[1, 0], [2, 0], [1, 1], [2, 1]])
        ];
        break;
      case BoardType.zreptil:
        this.rows = [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ];
        this.validCount = 47;
        this.parts = [
          new PartData('u', 1, [[0, 1], [1, 1], [2, 1], [2, 0]], [4, 5, 6, 7]),
          new PartData('n', 2, [[0, 1], [0, 2], [-1, 2], [-1, 3]]),
          new PartData('f', 3, [[1, 0], [2, 0], [1, -1], [2, 1]]),
          new PartData('z', 4, [[-1, 0], [-1, 1], [-1, 2], [-2, 2]], [2, 3, 6, 7]),
          new PartData('v', 5, [[0, 1], [0, 2], [1, 2], [2, 2]], [4, 5, 6, 7]),
//          new PartData('m', 5, [[1, 0], [0, 1], [1, 1], [0, 2], [1, 2]], [2, 3, 4, 5, 6, 7]),
          new PartData('y', 6, [[1, 0], [2, 0], [3, 0], [1, 1]]),
          new PartData('l', 7, [[0, 1], [0, 2], [0, 3], [1, 3]]),
          new PartData('t', 8, [[0, 1], [0, 2], [1, 1], [2, 1]]),
//          new PartData('x', 8, [[1, 0], [0, 1], [-1, 0], [0, -1]]),
          new PartData('p', 9, [[1, 0], [2, 0], [1, 1], [2, 1]]),
          new PartData('-', 10, [[1, 0]], [2, 3, 4, 5, 6, 7]),
        ];
        break;
      case BoardType.pentomino:
        this.rows = [
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
        ];
        this.validCount = 60;
        this.parts = [
          new PartData('f', 1, [[1, 0], [2, 0], [1, -1], [2, 1]]),
          new PartData('i', 2, [[1, 0], [2, 0], [3, 0], [4, 0]]),
          new PartData('l', 3, [[0, 1], [0, 2], [0, 3], [1, 3]]),
          new PartData('n', 4, [[0, 1], [0, 2], [-1, 2], [-1, 3]]),
          new PartData('p', 5, [[1, 0], [2, 0], [1, 1], [2, 1]]),
          new PartData('t', 6, [[0, 1], [0, 2], [1, 1], [2, 1]]),
          new PartData('u', 7, [[0, 1], [1, 1], [2, 1], [2, 0]], [4, 5, 6, 7]),
          new PartData('v', 8, [[0, 1], [0, 2], [1, 2], [2, 2]], [4, 5, 6, 7]),
          new PartData('w', 9, [[0, 1], [1, 1], [1, 2], [2, 2]], [4, 5, 6, 7]),
          new PartData('x', 10, [[1, 0], [0, 1], [-1, 0], [0, -1]]),
          new PartData('y', 11, [[1, 0], [2, 0], [3, 0], [1, 1]]),
          new PartData('z', 12, [[-1, 0], [-1, 1], [-1, 2], [-2, 2]], [2, 3, 6, 7]),
        ];
        break;
    }
    this.maxY = this.rows.length;
    this.maxX = this.rows[0].length;
  }

  static decodeDate(date: number): { w: number, m: number, d: number } {
    const w = Math.min(6, Math.max(0, Math.floor(date / 10000)));
    const m = Math.min(12, Math.max(1, Math.floor((date - w * 10000) / 100)));
    const d = Math.min(31, Math.max(1, date % 100));
    return {w, m, d};
  }

  static weekdays(type: BoardType): string[] {
    switch (type) {
      case BoardType.zreptil:
        return ['30', '40', '31', '41', '32', '42', '33'];
      case BoardType.pentomino:
        return ['00', '10', '20', '30', '40', '50', '60'];
    }
    return [];
  }

  static days(type: BoardType): string[] {
    switch (type) {
      case BoardType.zreptil:
        return [
          '43',
          '04', '14', '24', '34', '44',
          '05', '15', '25', '35', '45',
          '06', '16', '26', '36', '46',
          '07', '17', '27', '37', '47',
          '08', '18', '28', '38', '48',
          '09', '19', '29', '39', '49'
        ];
      case BoardType.pentomino:
        return [
          '04', '14', '24', '34', '44', '54', '64',
          '05', '15', '25', '35', '45', '55', '65',
          '06', '16', '26', '36', '46', '56', '66',
          '07', '17', '27', '37', '47', '57', '67',
          '28', '38', '48'
        ];
    }
    return [
      '02', '12', '22', '32', '42', '52', '62',
      '03', '13', '23', '33', '43', '53', '63',
      '04', '14', '24', '34', '44', '54', '64',
      '05', '15', '25', '35', '45', '55', '65',
      '06', '16', '26'
    ];
  }

  static months(type: BoardType): string[] {
    switch (type) {
      case BoardType.zreptil:
        return [
          '00', '10', '20', '01', '11', '21', '02', '12', '22', '03', '13', '23'
        ];
      case BoardType.pentomino:
        return [
          '11', '21', '31', '41', '51', '12', '22', '32', '42', '52', '23', '43'
        ];
    }
    return [
      '00', '10', '20', '30', '40', '50', '01', '11', '21', '31', '41', '51'
    ];
  }

  static weekdayNameFor(weekday: number): string {
    return ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][weekday] ?? '???';
  }

  static labelFor(type: BoardType, x: number, y: number): string {
    const months = [
      'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
      'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    let idx = BoardData.weekdays(type).indexOf(`${x}${y}`);
    if (idx >= 0) {
      return BoardData.weekdayNameFor(idx);
    }
    idx = BoardData.months(type).indexOf(`${x}${y}`);
    if (idx >= 0) {
      return months[idx];
    }
    idx = BoardData.days(type).indexOf(`${x}${y}`);
    if (idx >= 0) {
      return `${idx + 1}`;
    }
    return ``;
  }
}
