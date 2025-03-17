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
  currPos: Point;

  modCounter = 0;

  constructor(public key: string,
              public idx: number,
              public orgPos: [number, number][],
              public skipMod: number[] = []) {
    this.pos = orgPos?.map(p => p) ?? [];
  }
}
