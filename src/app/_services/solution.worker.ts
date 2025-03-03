/// <reference lib="webworker" />

class Point {
  constructor(public x: number, public y: number) {
  }

  set(src: Point) {
    this.x = src.x;
    this.y = src.y;
  }
}

class PartData {
  pos: [number, number][];
  mod: number = 0;
  max: Point;
  min: Point;

  modCounter = 0;

  constructor(public key: string, public idx: number, _pos: [number, number][]) {
    this.pos = _pos?.map(p => p);
    this.min = new Point(0, 0);
    this.max = new Point(7, 7);
    this.currPos = new Point(0, 0);
  }

  private _currPos: Point;

  get currPos(): Point {
    return this._currPos;
  }

  set currPos(value: Point) {
    this._currPos = value;
    this.calcLimits();
  }

  calcLimits() {
    this.min.x = -this.pos.reduce((v, p) => p[0] < v ? p[0] : v, 0);
    this.min.y = -this.pos.reduce((v, p) => p[1] < v ? p[1] : v, 0);
    this.max.x = 6 - this.pos.reduce((v, p) => p[0] > v ? p[0] : v, -Infinity);
    this.max.y = 6 - this.pos.reduce((v, p) => p[1] > v ? p[1] : v, -Infinity);
  }

  fill(src: PartData) {
    this.key = src.key;
    this.idx = src.idx;
    this.mod = src.mod;
    this.currPos.set(src.currPos);
    this.pos = [];
    for (const pos of src.pos) {
      this.pos.push(pos);
    }
  }

  mirror() {
    this.pos = this.pos.map(p => [p[0], -p[1]]);
  }

  rotate() {
    this.pos = this.pos.map(p => [-p[1], p[0]]);
  }

  modify() {
    this.modCounter++;
    switch (this.mod) {
      case 0:
      case 1:
      case 2:
      case 4:
      case 5:
      case 6:
      case 7:
        this.rotate();
        break;
      case 3:
        this.rotate();
        this.mirror();
        break;
      case 8:
        this.rotate();
        this.mirror();
        this.mod = -1;
        break;
    }
    this.mod++;
    this.calcLimits();
  }

  reset() {
    while (this.mod !== 0) {
      this.modify();
    }
  }

}

class PuzzlendarSolver {
  board: number[][];
  parts: PartData[] = [
    new PartData('u', 1, [[0, 1], [1, 1], [2, 1], [2, 0]]),
    new PartData('n', 2, [[0, 1], [0, 2], [-1, 2], [-1, 3]]),
    new PartData('z', 3, [[-1, 0], [-1, 1], [-1, 2], [-2, 2]]),
    new PartData('v', 4, [[0, 1], [0, 2], [1, 2], [2, 2]]),
    new PartData('m', 5, [[1, 0], [0, 1], [1, 1], [0, 2], [1, 2]]),
    new PartData('y', 6, [[1, 0], [2, 0], [3, 0], [1, 1]]),
//    new PartData('t', 6, [[0, 1], [0, 2], [1, 1], [2, 1]]),
    new PartData('l', 7, [[0, 1], [0, 2], [0, 3], [1, 3]]),
    new PartData('p', 8, [[1, 0], [2, 0], [1, 1], [2, 1]])
  ];
  running: boolean;

  constructor() {
    // public msg: MessageService
  }

  get isValid(): boolean {
    const count = this.board.reduce((acc, row) =>
      acc + row.reduce((acc, cell) => acc + (cell >= 0 && cell <= 8 ? 1 : 0), 0), 0);

    return count === 41;
  }

  get boardString(): string {
    let ret = '';
    for (const row of this.board) {
      for (let i = 0; i < row.length; i++) {
        const p = row[i];
        if (p >= 1 && p <= 8 && ret.indexOf(this.parts[p - 1].key) < 0) {
          ret += this.parts[p - 1].key;
        }
      }
    }
    return ret;
  }

  get boardData(): any {
    let date = 0;
    for (let y = 0; y < this.board.length; y++) {
      for (let x = 0; x < this.board[y].length; x++) {
        if (this.board[y][x] === 9) {
          if (y < 2) {
            date += 100 * (y * 6 + x + 1);
          } else {
            date += (y - 2) * 7 + x + 1;
          }
        }
      }
    }
    return {
      board: this.board,
      boardString: this.boardString,
      date: date
    };
  }

  clearBoard(part?: PartData, board = this.board): void {
    for (const row of board) {
      for (let i = 0; i < row.length; i++) {
        if (part?.idx != null) {
          if (row[i] === part.idx) {
            row[i] = 0;
          }
        } else {
          if (row[i] !== 9 && row[i] !== -1) {
            row[i] = 0;
          }
        }
      }
    }
  }

  permutate(str: string): string[] {
    if (str.length <= 1) {
      return [str];
    }

    const ret: string[] = [];

    for (let i = 0; i < str.length; i++) {
      const aktuellerBuchstabe = str[i];
      const rest = str.slice(0, i) + str.slice(i + 1);
      const restPermutationen = this.permutate(rest);

      for (const perm of restPermutationen) {
        ret.push(aktuellerBuchstabe + perm);
      }
    }
    return ret;
  }

  solve(start: string, type: string): boolean {
    if (!this.isValid) {
      return false;
    }
    this.findSolution(start, type);
    return true;
  }

  findSolution(start: string, type: string) {
    this.clearBoard();
    const perms = this.permutate(this.parts.map(p => p.key).join(''));
    let idx = 0;
    let b: number[][] = null;
    for (const src of perms) {
      if (src === start) {
        start = null;
      } else if (start == null) {
        postMessage({cmd: 'progress', max: perms.length, value: idx});
        if (this.placeParts(src)) {
          if (type === 'solve-day' || type === 'solve-all') {
            if (b == null) {
              b = this.board.map(row => row.map(f => f));
            }
            postMessage({cmd: 'partialSolution', ...this.boardData});
          } else {
            postMessage({cmd: 'solution', ...this.boardData});
            return;
          }
        }
      }
      idx++;
    }

    switch (type) {
      case 'solve-day':
        if (b != null) {
          this.board = b;
          postMessage({cmd: 'finalSolution', ...this.boardData});
        } else {
          postMessage({cmd: 'finalSolution'});
        }
        break;
      case 'solve-all':
        postMessage({cmd: 'daySolution', ...this.boardData});
        break;
    }
  }

  nextFreeField(pt: Point, board: number[][]): Point {
    while (board[pt.y][pt.x] !== 0) {
      pt.x++;
      if (pt.x >= 7) {
        pt.x = 0;
        pt.y++;
        if (pt.y >= 7) {
          return null;
        }
      }
    }
    return pt;
  }

  firstFreeField(board: number[][]): Point {
    return this.nextFreeField(new Point(0, 0), board);
  }

  placeParts(partKeys: string, board = this.board) {
    this.clearBoard();
    const partList = this.parts;//new PartData(p.key, p.idx, p.mod, p.pos));
    const parts: PartData[] = [];
    for (let i = 0; i < partKeys.length; i++) {
      const idx = partList.findIndex(p => p?.key === partKeys.substring(i, i + 1));
      if (idx >= 0) {
        partList[idx].modCounter = 0;
        parts.push(partList[idx]);
      }
    }
    return this.nextPart(parts, board);
  }

  nextPart(orgParts: PartData[], board = this.board): boolean {
    if (orgParts.length === 0) {
      return true;
    }
    let parts = orgParts.slice();
    const part = parts.splice(0, 1)[0];
    this.clearBoard(part);
    for (let i = 0; i < 8; i++) {
//      console.log(`${i}-${part.key}${part.mod}`);
      const savePart = new PartData(null, null, []);
      savePart.fill(part);
      const pt = this.firstFreeField(board);
      this.debug(part, 'neuer Punkt', part.key, part.mod, pt);
      this.debugPart(part);
      const p = this.placePart(part, pt, board);
      if (p != null) {
        if (this.nextPart(parts, board)) {
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
      part.fill(savePart);
      part.modify();
    }
    return false;
  }

  placePart(part: PartData, org: Point, board: number[][]): PartData {
    part.currPos.set(org);
    part.calcLimits();
    this.debugPart(part);
    while (part.currPos.y <= part.max.y) {
      while (part.currPos.x <= part.max.x) {
        this.clearBoard(part, board);
        let onPoint = false;
        let list = [[0, 0], ...part.pos];
        for (let i = 0; i < list.length; i++) {
          const x = part.currPos.x + list[i][0];
          const y = part.currPos.y + list[i][1];
          if (x < 0 || x > 6 || y < 0 || y > 6 || board[y][x] !== 0) {
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
            board[part.currPos.y + pos[1]][part.currPos.x + pos[0]] = part.idx;
          }
          return part;
        }
        part.currPos.x++;
        part.calcLimits();
      }
      part.currPos.x = part.min.x;
      part.currPos.y++;
      part.calcLimits();
    }
    part.currPos.set(org);
    part.calcLimits();
    this.debug(part, part.key, part.mod, 'passt auf keine Position');
    part.reset();
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
      this.board.map((row, y) => {
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
            case 9:
              ret = '*';
              break;

          }
          return `${ret}${suffix}`;
        }).join('')
      }).join('\n')];

    // console.log(Utils.join(msg, '\n'), mark);
  }

  debugPart(part: PartData) {
    const area: any[] = [];
    for (let y = 0; y < 7; y++) {
      const row = [];
      for (let x = 0; x < 7; x++) {
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

addEventListener('message', ({data}) => {
  try {
    const srv = new PuzzlendarSolver();
    srv.board = data.board ?? srv.board;
    switch (data.cmd) {
      case 'clearBoard':
        srv.clearBoard();
        postMessage({cmd: 'setBoard', ...srv.boardData, state: 0});
        break;
      case 'setBoard':
        postMessage({cmd: 'setBoard', ...srv.boardData, state: 0});
        break;
      case 'placeParts':
        srv.placeParts(data.partKeys, data.board);
        postMessage({cmd: 'setBoard', ...srv.boardData, state: 0});
        break;
      case 'solve-single':
      case 'solve-all':
      case 'solve-day':
        if (data.found != null && Array.isArray(data.found)) {
          data.found = data.found[data.found.length - 1];
        }
        if (srv.solve(data.found, data.cmd)) {
          if (data.cmd === 'solve-single ' || data.cmd === 'solve-day') {
            postMessage({cmd: 'solution', ...srv.boardData});
          }
        } else {
          postMessage({error: `Es müssen genau zwei Felder ausgewählt sein`, state: 0});
        }
        break;
      default:
        postMessage({error: `Fehlerhafter Workeraufruf: cmd "${data.cmd}" unbekannt`, state: 0});
        break;
    }
  } catch (ex) {
    console.error(ex);
  }
});
