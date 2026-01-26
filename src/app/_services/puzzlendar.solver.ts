import {PartData, Point} from '@/_model/part-data';
import {BoardData} from '@/_model/board-data';

function* permutationen(str: string): Generator<string> {
  const arr = str.split('');
  const n = arr.length;

  function* permutiere(a: string[], n: number): Generator<string[]> {
    if (n <= 1) {
      yield a.slice();
    } else {
      for (let i = 0; i < n; i++) {
        yield* permutiere(a, n - 1);
        const j = n % 2 === 0 ? i : 0;
        [a[n - 1], a[j]] = [a[j], a[n - 1]];
      }
    }
  }

  for (const perm of permutiere(arr, n)) {
    yield perm.join('');
  }
}

class TryData {
  max: number;
  last: number;
  idx: number;
  src: string;
  b: number[][];
  single: string;
  type: string;
  alreadyFound: string[];
  startAt: string;
}

export class PartManager {
  setCurrPos(part: PartData, value: Point) {
    part.currPos = value;
    this.calcLimits(part);
  }

  calcLimits(part: PartData) {
    part.min.x = -part.pos.reduce((v, p) => p[0] < v ? p[0] : v, 0);
    part.min.y = -part.pos.reduce((v, p) => p[1] < v ? p[1] : v, 0);
    part.max.x = 7 - part.pos.reduce((v, p) => p[0] > v ? p[0] : v, -Infinity);
    part.max.y = 6 - part.pos.reduce((v, p) => p[1] > v ? p[1] : v, -Infinity);
  }

  reset(part: PartData) {
    part.pos = part.orgPos?.map(p => p) ?? [];
    part.pos.splice(0, 0, [0, 0]);
    part.min = new Point(0, 0);
    part.max = new Point(8, 7);
    this.setCurrPos(part, new Point(0, 0));
    part.mod = 0;
  }

  fill(part: PartData, src: PartData) {
    part.key = src.key;
    part.idx = src.idx;
    part.mod = src.mod;
    part.currPos ??= src.currPos;
    part.currPos.set(src.currPos);
    part.pos = [];
    for (const pos of src.pos) {
      part.pos.push(pos);
    }
  }

  maxPos(part: PartData, org: Point): Point {
    return new Point(org.x + part.min.x, org.y + part.min.y);
  }

  minPos(part: PartData, org: Point): Point {
    return new Point(org.x - (8 - part.max.x), org.y - (7 - part.max.y));
  }

  mirror(part: PartData) {
    part.pos = part.pos.map(p => [p[0], -p[1]]);
    // if (part.key >= 'a' && part.key <= 'z') {
    //   part.key = part.key.toUpperCase();
    // } else {
    //   part.key = part.key.toLowerCase();
    // }
  }

  rotate(part: PartData) {
    part.pos = part.pos.map(p => [-p[1], p[0]]);
  }

  modify(part: PartData) {
    part.modCounter++;
    switch (part.mod) {
      case 0:
      case 1:
      case 2:
      case 4:
      case 5:
      case 6:
      case 7:
        this.rotate(part);
        break;
      case 3:
        this.rotate(part);
        this.mirror(part);
        break;
      case 8:
        this.rotate(part);
        this.mirror(part);
        part.mod = -1;
        break;
    }
    part.mod++;
    if (part.skipMod.indexOf(part.mod) >= 0) {
      this.modify(part);
    } else {
      this.calcLimits(part);
    }
  }
}

export class PuzzlendarSolver {
  pm = new PartManager();

  constructor(public board: BoardData) {
    for (const part of this.parts) {
      this.pm.reset(part);
    }
  }

  get parts(): PartData[] {
    return this.board.parts;
  }

  get isValid(): boolean {
    const count = this.board.rows.reduce((acc, row) =>
      acc + row.reduce((acc, cell) => acc + (cell >= 0 && cell <= this.board.parts.length ? 1 : 0), 0), 0);
    return count === this.board.validCount;
  }

  get boardString(): string {
    let ret = '';
    for (const row of this.board.rows) {
      for (let i = 0; i < row.length; i++) {
        const p = row[i];
        if (p >= 1 && p <= this.board.parts.length && ret.indexOf(this.parts[p - 1].key) < 0) {
          ret += this.parts[p - 1].key;
        }
      }
    }
    return ret;
  }

  get boardData(): any {
    return {
      brd: this.board,
      boardString: this.boardString
    };
  }

  clearBoard(part?: PartData, brd = this.board): void {
    for (const row of brd.rows) {
      for (let i = 0; i < row.length; i++) {
        if (part?.idx != null) {
          if (row[i] === part.idx) {
            row[i] = 0;
          }
        } else {
          if (row[i] !== 99 && row[i] !== -1) {
            row[i] = 0;
          }
        }
      }
    }
  }

  solve(alreadyFound: string[], single: string, type: string): boolean {
    if (!this.isValid) {
      return false;
    }
    this.findSolution(alreadyFound, single, type);
    return true;
  }

  findSolution(alreadyFound: string[], single: string, type: string) {
    this.clearBoard();
    alreadyFound ??= [];
    if (type === 'solve-oneperday' && alreadyFound.length > 0) {
      postMessage({cmd: 'oneperdaySolution', ...this.boardData});
      return;
    }
    if (type === 'solve-all' && alreadyFound?.[0] === '*') {
      postMessage({cmd: 'dayComplete', ...this.boardData});
      return;
    }
    const src = this.parts.map(p => p.key).join('');
    const max = Array.from({length: src.length}, (_, i) => i + 1)
      .reduce((acc, val) => acc * val, 1);
    const data: TryData = {
      idx: 0,
      last: 0,
      max: max,
      src: src,
      type: type,
      b: null,
      single: single,
      alreadyFound: alreadyFound,
      startAt: alreadyFound?.[alreadyFound?.length - 1]
    }
    const permList = permutationen(data.src);
    for (const p of permList) {
      if (!this.trySolution(p, data)) {
        return;
      }
    }
    switch (type) {
      case 'solve-single':
        postMessage({cmd: 'solution', ...this.boardData});
        break;
      case 'solve-day':
        if (data.b != null) {
          this.board.rows = data.b;
        }
        postMessage({cmd: 'finalSolution', ...this.boardData});
        break;
      case 'solve-all':
        postMessage({cmd: 'daySolution', ...this.boardData});
        break;
      case 'solve-oneperday':
        postMessage({cmd: 'noSolutionForDay', ...this.boardData});
        break;
    }
    return;
  }

  trySolution(src: string, data: TryData): boolean {
    if (data.startAt != null) {
      if (data.startAt === src) {
        data.startAt = null;
      }
      data.idx++;
      return true;
    }
    if (data.single != null || data.alreadyFound.indexOf(src) < 0) {
      data.last++;
      if (data.last > 1000) {
        data.last = 0;
        postMessage({cmd: 'progress', max: data.max, value: data.idx, text: src});
      }
      if (this.placeParts(src)) {
        if (data.type === 'solve-day' || data.type === 'solve-all') {
          if (data.b == null) {
            data.b = this.board.rows.map(row => row.map(f => f));
          }
          data.last = 0;
          postMessage({cmd: 'partialSolution', ...this.boardData});
        } else if (data.type === 'solve-oneperday') {
          data.last = 0;
          postMessage({cmd: 'oneperdaySolution', ...this.boardData});
          return false;
        } else {
          data.last = 0;
          postMessage({cmd: 'solution', ...this.boardData});
          return false;
        }
      }
    }
    data.idx++;
    return true;
  }

  nextFreeField(pt: Point, brd: BoardData): Point {
    while (brd.rows[pt.y][pt.x] !== 0) {
      pt.x++;
      if (pt.x >= brd.rows[pt.y].length) {
        pt.x = 0;
        pt.y++;
        if (pt.y >= brd.rows.length) {
          return null;
        }
      }
    }
    return pt;
  }

  firstFreeField(brd: BoardData): Point {
    return this.nextFreeField(new Point(0, 0), brd);
  }

  placeParts(partKeys: string, brd = this.board) {
    this.clearBoard();
    const partList = this.parts;//new PartData(p.key, p.idx, p.mod, p.pos));
    const parts: PartData[] = [];
    for (let i = 0; i < partKeys.length; i++) {
//      const idx = partList.findIndex(p => p?.key?.toLowerCase() === partKeys.substring(i, i + 1)?.toLowerCase());
      const idx = partList.findIndex(p => p?.key === partKeys.substring(i, i + 1));
      if (idx >= 0) {
        partList[idx].modCounter = 0;
        parts.push(partList[idx]);
      }
    }
    return this.nextPart(parts, brd);
  }

  nextPart(orgParts: PartData[], brd = this.board): boolean {
    if (orgParts.length === 0) {
      return true;
    }
    let parts = orgParts.slice();
    const part = parts.splice(0, 1)[0];
    this.clearBoard(part);
    for (let i = 0; i < 8; i++) {
//      console.log(`${i}-${part.key}${part.mod}`);
      const savePart = new PartData(null, null, []);
      this.pm.fill(savePart, part);
      const pt = this.firstFreeField(brd);
      this.debug(part, 'neuer Punkt', part.key, part.mod, pt);
      this.debugPart(part);
      const p = this.placePart(part, pt, brd);
      if (p != null) {
        if (this.nextPart(parts, brd)) {
          return true;
        }
//         this.debug(part, part.key, part.mod, 'passt', parts);
//         this.debugBoard(pt);
//         for (let j = 0; j < 8; j++) {
// //          console.log(`${j}-${parts[0]?.key}${parts[0]?.mod}`);
//           if (this.nextPart(parts, board)) {
//             return true;
//           } else {
//             this.clearBoard(parts[0]);
//             parts[0].modify();
//           }
//         }
//         return false;
      }
      this.debugBoard(pt);
      this.clearBoard(part);
      this.pm.fill(part, savePart);
      this.pm.modify(part);
    }
    this.pm.reset(part);
    return false;
  }

  placePart(part: PartData, org: Point, brd: BoardData): PartData {
    part.currPos.set(org);
    this.pm.calcLimits(part);
    this.debugPart(part);
    while (part.currPos.y <= this.pm.maxPos(part, org).y) {
      while (part.currPos.x <= this.pm.maxPos(part, org).x) {
        // while (part.currPos.y <= part.max.y) {
        //   while (part.currPos.x <= part.max.x) {
        this.clearBoard(part, brd);
        let onPoint = false;
        let list = part.pos.map(p => p);
        for (let i = 0; i < list.length; i++) {
          const x = part.currPos.x + list[i][0];
          const y = part.currPos.y + list[i][1];
          if (y < 0 || y >= brd.rows.length || x < 0 || x >= brd.rows[y].length || brd.rows[y][x] !== 0) {
            // this.debug(part, 'passt nicht', `x${part.currPos.x}y${part.currPos.y}`, part.key, part.mod, `i${i} x${x} y${y}`, part);
            onPoint = false;
            i = list.length
          } else {
            if (x === org.x && y === org.y) {
              onPoint = true;
            }
          }
        }
        if (onPoint) {
          this.debug(part, part.key, part.mod, 'passt auf', org);
          for (const pos of list) {
            brd.rows[part.currPos.y + pos[1]][part.currPos.x + pos[0]] = part.idx;
          }
          return part;
        }
        part.currPos.x++;
        this.pm.calcLimits(part);
      }
      part.currPos.x = this.pm.minPos(part, org).x;
      // part.currPos.x = part.min.x;
      part.currPos.y++;
      this.pm.calcLimits(part);
    }
    part.currPos.set(org);
    this.pm.calcLimits(part);
    this.debug(part, part.key, part.mod, 'passt auf keine Position');
    this.pm.reset(part);
    return null;
  }

  debug(part: PartData, ...data: any[]) {
    if (false && (part.key === 'l' && part.mod === 0)) {
      console.log(...data);
    }
  }

  debugBoard(mark: Point, title?: string) {
    return;
    const msg = [title,
      this.board.rows.map((row, y) => {
        return row.map((cell, x) => {
          let ret = `${cell}`;
          const suffix = (x === mark?.x && y === mark?.y) ? '<' : ' ';
          switch (cell) {
            case -1:
            case -2:
              ret = '#';
              break;
            case 0:
              ret = '-';
              break;
            case 99:
              ret = '*';
              break;

          }
          return `${ret}${suffix}`;
        }).join('')
      }).join('\n')];

    // console.log(Utils.join(msg, '\n'), mark);
  }

  debugPart(part: PartData) {
    return;
    const area: any[] = [];
    for (let y = 0; y < this.board.rows.length; y++) {
      const row = [];
      for (let x = 0; x < this.board.rows[y].length; x++) {
        row.push(0);
      }
      area.push(row);
    }
    let x = 3;
    let y = 3;
    let suffix = '<';
    for (const p of [[0, 0], ...part.pos]) {
      area[y + p[1]][x + p[0]] = `${part.idx}${suffix}`;
      suffix = ' ';
    }
    for (let y = 0; y < area.length; y++) {
      if (area[y].reduce((a: any, b: any) => a === 0 && b === 0 ? 0 : 1, 0) === 0) {
        area.splice(y, 1);
        y--;
      }
    }
    const msg = [`${part.key}${part.mod}-${part.min.x}/${part.min.y}-${part.currPos.x}/${part.currPos.y}-${part.max.x}/${part.max.y}`,
      area.map((row, y) => {
        return row.map((cell: any, x: number) => {
          return cell === 0 ? '  ' : `${cell}`;
        }).join('')
      }).join('\n')];
    this.debug(part, msg.join('\n'));
  }
}
