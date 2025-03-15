import {PartData, Point} from '@/_model/part-data';

export class PuzzlendarSolver {
  board: number[][];
  parts: PartData[] = [
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
      const c = str[i];
      const rest = str.slice(0, i) + str.slice(i + 1);
      const restPermutationen = this.permutate(rest);

      for (const perm of restPermutationen) {
        ret.push(c + perm);
      }
    }
    return ret;
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
    let perms = [single];
    if (single == null) {
      perms = this.permutate(this.parts.map(p => p.key).join(''));
    }
    let idx = 0;
    let b: number[][] = null;
    alreadyFound ??= [];
    let lastProgress = 0;
    if (type === 'solve-oneperday' && alreadyFound.length > 0) {
      postMessage({cmd: 'oneperdaySolution', ...this.boardData});
      return;
    }
    if (alreadyFound.indexOf('*') < 0) {
      for (const src of perms) {
        if (single != null || alreadyFound.indexOf(src) < 0) {
          lastProgress++;
          if (lastProgress > 1000) {
            lastProgress = 0;
            postMessage({cmd: 'progress', max: perms.length, value: idx});
          }
          if (this.placeParts(src)) {
            if (type === 'solve-day' || type === 'solve-all') {
              if (b == null) {
                b = this.board.map(row => row.map(f => f));
              }
              lastProgress = 0;
              postMessage({cmd: 'partialSolution', ...this.boardData});
            } else if (type === 'solve-oneperday') {
              lastProgress = 0;
              postMessage({cmd: 'oneperdaySolution', ...this.boardData});
              return;
            } else {
              lastProgress = 0;
              postMessage({cmd: 'solution', ...this.boardData});
              return;
            }
          }
        }
        idx++;
      }
    }

    switch (type) {
      case 'solve-single':
        postMessage({cmd: 'solution', ...this.boardData});
        break;
      case 'solve-day':
        if (b != null) {
          this.board = b;
        }
        postMessage({cmd: 'finalSolution', ...this.boardData});
        break;
      case 'solve-all':
        postMessage({cmd: 'daySolution', ...this.boardData});
        break;
      case 'solve-oneperday':
        lastProgress = 0;
        postMessage({cmd: 'noSolutionForDay', ...this.boardData});
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
    part.reset();
    return false;
  }

  placePart(part: PartData, org: Point, board: number[][]): PartData {
    part.currPos.set(org);
    part.calcLimits();
    this.debugPart(part);
    while (part.currPos.y <= part.maxPos(org).y) {
      while (part.currPos.x <= part.maxPos(org).x) {
        // while (part.currPos.y <= part.max.y) {
        //   while (part.currPos.x <= part.max.x) {
        this.clearBoard(part, board);
        let onPoint = false;
        let list = part.pos.map(p => p);
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
      part.currPos.x = part.minPos(org).x;
      // part.currPos.x = part.min.x;
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
