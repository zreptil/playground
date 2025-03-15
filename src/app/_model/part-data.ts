export class Point {
  constructor(public x: number, public y: number) {
  }

  set(src: Point) {
    this.x = src.x;
    this.y = src.y;
  }
}

export class PartData {
  pos: [number, number][];
  mod: number = 0;
  max: Point;
  min: Point;

  modCounter = 0;

  constructor(public key: string,
              public idx: number,
              private _pos: [number, number][],
              public skipMod: number[] = []) {
    this.reset();
  }

  private _currPos: Point;

  get currPos(): Point {
    return this._currPos;
  }

  set currPos(value: Point) {
    this._currPos = value;
    this.calcLimits();
  }

  reset() {
    this.pos = this._pos?.map(p => p) ?? [];
    this.pos.splice(0, 0, [0, 0]);
    this.min = new Point(0, 0);
    this.max = new Point(7, 7);
    this.currPos = new Point(0, 0);
    this.mod = 0;
  }

  maxPos(org: Point): Point {
    return new Point(org.x + this.min.x, org.y + this.min.y);
  }

  minPos(org: Point): Point {
    return new Point(org.x - (7 - this.max.x), org.y - (7 - this.max.y));
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
    if (this.skipMod.indexOf(this.mod) >= 0) {
      this.modify();
    } else {
      this.calcLimits();
    }
  }
}
