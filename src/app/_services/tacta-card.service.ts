import {Injectable} from '@angular/core';
import {GLOBALS} from '@/_services/globals.service';
import {CardConfig, TactaService} from '@/_services/tacta.service';
import {Utils} from '@/classes/utils';

export class TactaCanvas {
  ctx: CanvasRenderingContext2D;
  info: string;
  paths: { [key: string]: Path2D } = {};
  cardRect: Path2D;
  isMarked = false;
  markedAreas: string = '';
  xOrg: number;
  yOrg: number;
  cardIdx: number;
  cardWidth: number;
  cardHeight: number;
  cardBorder: number;
  cards: TactaCanvas[] = [];
  parentLink: string;

  constructor(src: any, public ts: TactaService) {
    this.ctx = src.ctx;
    this.paths = {};
    this.cardIdx = src.game?.cardIdx ?? -1;
    this.parentLink = src.game?.parentLink;
    const scale = src.scale ?? 1;
    this.cardWidth = src.cardWidth ?? CardConfig.defWidth * scale;
    this.cardHeight = src.cardHeight ?? CardConfig.defHeight * scale;
    this.cardBorder = src.cardBorder ?? CardConfig.defBorder * scale;
    this.xOrg = src.xMid - this.cardWidth / 2;
    this.yOrg = src.yMid - this.cardHeight / 2;
    for (const card of (src.game?.linkedCards ?? [])) {
      this.cards.push(this.ts.createTactaCanvas({
        ctx: this.ctx,
        cardWidth: this.cardWidth,
        cardHeight: this.cardHeight,
        cardBorder: this.cardBorder,
        game: card,
        xMid: this.xOrg,
        yMid: this.yOrg
      }));
    }
    this.markedAreas = src.markedAreas;
  }

  get config(): CardConfig {
    let idx = this.cardIdx;
    if (idx > this.ts.deck.length) {
      idx -= 128;
      this.ts.deck[idx].flipped = true;
    } else if (this.ts.deck[idx] != null) {
      this.ts.deck[idx].flipped = false;
    }

    return this.ts.deck[idx];
  }
}

@Injectable({
  providedIn: 'root'
})
export class TactaCardService {
  constructor(public ts: TactaService) {
  }

  drawScore(cvs: TactaCanvas, dir: string, score: string, xm: number, ym: number, size: number) {
    if (GLOBALS.isDebug) {
      this.centerText(cvs, cvs.config.flipped ? dir : (cvs.info ?? `${Utils.hex(cvs.cardIdx)}`), xm, ym);
    } else if (score !== '0') {
      cvs.ctx.arc(xm, ym, size, 0, Math.PI * 2);
    }
  }

  drawCorner3(cvs: TactaCanvas, dir: string, score = '') {
    const bw = cvs.cardBorder;
    const x = bw / 2;
    const y = bw / 2;
    const cw = cvs.cardWidth - bw;
    const ch = cvs.cardHeight - bw;
    const w = cw / 2 - bw * 2;
    cvs.ctx.lineJoin = 'round';
    cvs.ctx.lineCap = 'round';
    switch (dir) {
      case 'a':
        this.drawPath(cvs, dir, [
          [x + bw, y + bw],
          [x + bw + w, y + bw],
          [x + bw, y + bw + w]], score);
        break;
      case 'b':
        this.drawPath(cvs, dir, [
          [x + cw - bw, y + bw],
          [x + cw - bw - w, y + bw],
          [x + cw - bw, y + bw + w]], score);
        break;
      case 'c':
        this.drawPath(cvs, dir, [
          [x + cw - bw, y + ch - bw],
          [x + cw - bw - w, y + ch - bw],
          [x + cw - bw, y + ch - bw - w]], score);
        break;
      case 'd':
        this.drawPath(cvs, dir, [
          [x + bw, y + ch - bw],
          [x + bw + w, y + ch - bw],
          [x + bw, y + ch - bw - w]], score);
        break;
    }
  }

  drawCorner4(cvs: TactaCanvas, dir: string, score = '') {
    const bw = cvs.cardBorder;
    const x = bw / 2;
    const y = bw / 2;
    const cw = cvs.cardWidth;
    const ch = cvs.cardHeight;
    const w = cw / 2 - bw;
    cvs.ctx.lineJoin = 'round';
    cvs.ctx.lineCap = 'round';
    switch (dir) {
      case 'e':
        this.drawPath(cvs, dir, [
          [x + bw, y + bw], [x + w, y + bw],
          [x + w, y + w], [x + bw, y + w]
        ], score);
        break;
      case 'f':
        this.drawPath(cvs, dir, [
          [x + cw / 2, y + bw], [x + cw - bw * 2, y + bw],
          [x + cw - bw * 2, y + w], [x + cw / 2, y + w]
        ], score);
        break;
      case 'g':
        this.drawPath(cvs, dir, [
          [x + cw / 2, y + ch - w - bw], [x + cw - bw * 2, y + ch - w - bw],
          [x + cw - bw * 2, y + ch - bw * 2], [x + cw / 2, y + ch - bw * 2]
        ], score);
        break;
      case 'h':
        this.drawPath(cvs, dir, [
          [x + bw, y + ch - w - bw], [x + w, y + ch - w - bw],
          [x + w, y + ch - bw * 2], [x + bw, y + ch - bw * 2]
        ], score);
        break;
    }
  }

  drawEdge3(cvs: TactaCanvas, dir: string, score = '') {
    const bw = cvs.cardBorder;
    const x = cvs.cardWidth / 2;
    const y = bw / 2 + bw;
    const cw = cvs.cardWidth - bw;
    const w = cw / 2 - bw * 2;
    const dx = Math.sqrt(w * w + w * w) / 2;
    cvs.ctx.lineJoin = 'round';
    cvs.ctx.lineCap = 'round';
    switch (dir) {
      case 'i':
        this.drawPath(cvs, dir, [
          [x - dx, y],
          [x + dx, y],
          [x, y + dx]], score);
        break;
      case 'j':
        this.drawPath(cvs, dir, [
          [x + w + bw, cvs.cardHeight / 2 - dx],
          [x + w + bw, cvs.cardHeight / 2 + dx],
          [x + w + bw - dx, cvs.cardHeight / 2]], score);
        break;
      case 'k':
        this.drawPath(cvs, dir, [
          [x - dx, y + cvs.cardHeight - 3 * bw],
          [x + dx, y + cvs.cardHeight - 3 * bw],
          [x, y + cvs.cardHeight - 3 * bw - dx]], score);
        break;
      case 'l':
        this.drawPath(cvs, dir, [
          [x - w - bw, cvs.cardHeight / 2 - dx],
          [x - w - bw, cvs.cardHeight / 2 + dx],
          [x - w - bw + dx, cvs.cardHeight / 2]], score);
        break;
    }
  }

  drawEdge4(cvs: TactaCanvas, dir: string, score = '') {
    const bw = cvs.cardBorder;
    const xm = cvs.cardWidth / 2;
    const ym = cvs.cardHeight / 2;
    let x = bw + bw / 2;
    let y = bw + bw / 2;
    const cw = cvs.cardWidth - 3 * bw;
    const ch = (cvs.cardHeight - 2 * bw) / 7;
    cvs.ctx.lineJoin = 'round';
    cvs.ctx.lineCap = 'round';
    switch (dir) {
      // @ts-ignore
      case 'o':
        y = y + cvs.cardHeight - 3 * bw - ch;
      // fallthrough
      case 'm':
        this.drawPath(cvs, dir, [
          [xm - cw / 2, y], [xm + cw / 2, y],
          [xm + cw / 2, y + ch], [xm - cw / 2, y + ch]
        ], score);
        break;
      // @ts-ignore
      case 'n':
        x = x + cvs.cardWidth - 3 * bw - ch;
      // fallthrough
      case 'p':
        this.drawPath(cvs, dir, [
          [x, ym - cw / 2], [x, ym + cw / 2],
          [x + ch, ym + cw / 2], [x + ch, ym - cw / 2]
        ], score);
        break;
    }
  }

  drawSide4(cvs: TactaCanvas, dir: string, score = '') {
    const bw = cvs.cardBorder;
    const xm = cvs.cardWidth / 2;
    const ym = cvs.cardHeight / 2;
    let x = bw + bw / 2;
    let y = bw + bw / 2;
    const cw = cvs.cardHeight - 3 * bw;
    const ch = (cvs.cardHeight - 2 * bw) / 7;
    cvs.ctx.lineJoin = 'round';
    cvs.ctx.lineCap = 'round';
    switch (dir) {
      // @ts-ignore
      case 'q':
        x = x + cvs.cardWidth - 3 * bw - ch;
      // fallthrough
      case 'r':
        this.drawPath(cvs, dir, [
          [x, ym - cw / 2], [x + ch, ym - cw / 2],
          [x + ch, ym + cw / 2], [x, ym + cw / 2]
        ], score);
        break;
    }
  }

  drawPath(cvs: TactaCanvas, dir: string, points: number[][], score: string, lw = cvs.cardBorder): void {
    cvs.ctx.beginPath();
    cvs.ctx.moveTo(points[0][0], points[0][1]);
    const srcPath = new Path2D();
    srcPath.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      srcPath.lineTo(p[0], p[1]);
      cvs.ctx.lineTo(p[0], p[1]);
    }
    srcPath.closePath();
    const path = new Path2D();
    path.addPath(srcPath, cvs.ctx.getTransform());
    cvs.paths[dir] = path;
    const marked = dir !== '' && cvs.markedAreas?.indexOf(dir) >= 0;
    cvs.ctx.closePath();
    cvs.ctx.lineWidth = lw;
    cvs.ctx.strokeStyle = marked ? cvs.config.colors.sm : cvs.config.colors.s;
    if (marked || (score !== '0' && score !== '-')) {
      cvs.ctx.fillStyle = marked ? cvs.config.colors.fm : cvs.config.colors.f;
      cvs.ctx.fill();
    }
    cvs.ctx.stroke();

    // this.ctx.strokeStyle = 'yellow';
    // this.ctx.lineWidth = 1;
    // const w = (this.config.width + 2 * this.config.border) / 4;
    // this.ctx.moveTo(w, 0);
    // this.ctx.lineTo(w, this.config.height);
    // this.ctx.moveTo(0, w);
    // this.ctx.lineTo(this.config.width, w);
    // this.ctx.moveTo(this.config.width - w, 0);
    // this.ctx.lineTo(this.config.width - w, this.config.height);
    // this.ctx.stroke();

    if (score !== '') {
      cvs.ctx.beginPath();
      let xm = 0;
      let ym = 0;
      for (const p of points) {
        xm += p[0];
        ym += p[1];
      }
      xm = xm / points.length;
      ym = ym / points.length;
      const bw = cvs.cardBorder;
      let dx: number;
      let dy: number;
      const size = cvs.cardBorder * 2;
      switch (score) {
        case '0':
        case '1':
          this.drawScore(cvs, dir, score, xm, ym, size);
          break;
        case '2':
          dx = cvs.cardWidth / 12 + bw / 2;
          dy = dx;
          if (xm > cvs.cardWidth / 2) {
            dy = -dy;
          }
          if (ym > cvs.cardHeight / 2) {
            dx = -dx;
          }
          this.drawScore(cvs, dir, score, xm + dx, ym + dy, size);
          this.drawScore(cvs, dir, score, xm - dx, ym - dy, size);
          break;
        case '3':
          this.drawScore(cvs, dir, score, xm, ym, size);
          dx = cvs.cardWidth / 4 + bw / 2;
          dy = 0;
          if (ym === cvs.cardHeight / 2) {
            dy = dx;
            dx = 0;
          }
          this.drawScore(cvs, dir, score, xm + dx, ym + dy, size);
          this.drawScore(cvs, dir, score, xm - dx, ym - dy, size);
          break;
        case '4':
          dy = (cvs.cardHeight - bw * 3) / 5;
          ym -= dy * 1.5;
          for (let i = 0; i < 4; i++) {
            this.drawScore(cvs, dir, score, xm, ym + dy * i, size);
          }
          break;
      }
      cvs.ctx.fillStyle = 'white';
      cvs.ctx.fill();
    }
  }

  drawCard(cvs: TactaCanvas): void {
    cvs.ctx.save(); // Aktuellen Zustand speichern
    const link = this.ts.connectors[cvs.parentLink];
    if (link != null) {
      cvs.ctx.translate(50 * cvs.cardWidth / 100, 50 * cvs.cardHeight / 100);
      cvs.ctx.translate(link.x * cvs.cardWidth / 100, link.y * cvs.cardHeight / 100);
      //cvs.ctx.translate(cvs.xOrg, cvs.yOrg);
      cvs.ctx.rotate(link.deg * Math.PI / 180);
    } else {
      cvs.ctx.translate(cvs.xOrg, cvs.yOrg);
    }

    cvs.ctx.strokeStyle = cvs.isMarked ? cvs.config.colors.sm : 'white';
    cvs.ctx.fillStyle = cvs.isMarked ? cvs.config.colors.fm : 'black';

    cvs.paths = {};
    const bw = cvs.cardBorder;
    let x = bw / 2;
    let y = bw / 2;
    let w = cvs.cardWidth - bw;
    let h = cvs.cardHeight - bw;
    cvs.ctx.fillRect(x + bw, y + bw, w - bw * 2, h - bw * 2);

    const path = new Path2D();
    path.moveTo(x + bw, y + bw);
    path.lineTo(x + w - bw, y + bw);
    path.lineTo(x + w - bw, y + h - bw);
    path.lineTo(x + bw, y + h - bw);
    path.closePath();
    cvs.cardRect = new Path2D();
    cvs.cardRect.addPath(path, cvs.ctx.getTransform());

    // the outer frame
    cvs.ctx.beginPath();
    cvs.ctx.roundRect(x, y, w, h, bw * 2);
    cvs.ctx.strokeStyle = cvs.config.colors.f;
    cvs.ctx.lineWidth = bw;
    cvs.ctx.stroke();

    // the inner frame
    cvs.ctx.beginPath();
    x += bw;
    y += bw;
    w -= bw * 2;
    h -= bw * 2;
    cvs.ctx.roundRect(x, y, w, h, bw);
    cvs.ctx.strokeStyle = 'white';
    cvs.ctx.stroke();

    // the areas
    let score = 0;
    for (let i = 0; i < cvs.config.areas.length; i += 2) {
      const area = cvs.config.areas.substring(i, i + 2);
      const tmp = parseInt(area.substring(1));
      score += isNaN(tmp) ? 0 : tmp;
      this.drawArea(cvs, area);
    }

    const xm = cvs.cardWidth / 2;
    const ym = cvs.cardHeight / 2;
    const size = cvs.cardBorder * 3.5;
    cvs.ctx.fillStyle = cvs.config.colors.f;
    cvs.ctx.strokeStyle = 'white';
    switch (cvs.config.suite) {
      case 0:
        cvs.ctx.beginPath();
        cvs.ctx.arc(xm, ym, size, 0, Math.PI * 2);
        cvs.ctx.fill();
        cvs.ctx.arc(xm, ym, size - cvs.cardBorder / 3, 0, Math.PI * 2);
        cvs.ctx.lineWidth = cvs.cardBorder / 3;
        cvs.ctx.stroke();
        break;
      case 3:
        this.drawPath(cvs, '', [
          [xm - size, ym + size * 0.6],
          [xm + size, ym + size * 0.6],
          [xm, ym - size],
        ], '5', cvs.cardBorder / 2);
        break;
      case 4:
        this.drawPath(cvs, '', [
          [xm - size, ym - size],
          [xm + size, ym - size],
          [xm + size, ym + size],
          [xm - size, ym + size],
        ], '5', cvs.cardBorder / 2);
        break;
    }

    this.centerText(cvs, score > 0 ? `${score}` : 'X', xm, ym);

    for (const card of cvs.cards) {
      this.drawCard(card);
    }
    cvs.ctx.restore();
  }

  centerText(cvs: TactaCanvas, text: string, x: number, y: number) {
    cvs.ctx.textAlign = 'center';
    cvs.ctx.textBaseline = 'middle';
    cvs.ctx.font = `bold ${CardConfig.scale * 24 / 5}px Verdana`;
    cvs.ctx.fillStyle = 'white';
    const metrics = cvs.ctx.measureText(text);
    const textHeight =
      metrics.actualBoundingBoxAscent +
      metrics.actualBoundingBoxDescent;
    y += (metrics.actualBoundingBoxAscent - textHeight / 2);
    cvs.ctx.fillText(text, x, y);
  }

  isDirAvailable(cvs: TactaCanvas, dir: string): boolean {
    const blocked: any = {
      a: 'eilmpr',
      b: 'fijmnq',
      c: 'ghjknoq',
      d: 'hklopr',
      e: 'ailmpr',
      f: 'bijmnq',
      g: 'cjknoq',
      h: 'dklopr',
      i: 'abefmqr',
      j: 'bcfgnq',
      k: 'cdghoqr',
      l: 'adehpr',
      m: 'abefiqr',
      n: 'bcfgjq',
      o: 'cdghkqr',
      p: 'adehlr',
      q: 'bcfgjmno',
      r: 'adehlmop'
    }
    for (const card of cvs.cards) {
      if (blocked[card.parentLink?.substring(1, 2)].indexOf(dir) >= 0) {
        return false;
      }
    }
    return true;
  }

  drawArea(cvs: TactaCanvas, area: string): void {
    const dir = area.substring(0, 1);
    if (!this.isDirAvailable(cvs, dir)) {
      return;
    }
    const score = area.substring(1);
    if ('abcd'.indexOf(dir) >= 0) {
      this.drawCorner3(cvs, dir, score);
    }
    if ('efgh'.indexOf(dir) >= 0) {
      this.drawCorner4(cvs, dir, score);
    }
    if ('ijkl'.indexOf(dir) >= 0) {
      this.drawEdge3(cvs, dir, score);
    }
    if ('mnop'.indexOf(dir) >= 0) {
      this.drawEdge4(cvs, dir, score);
    }
    if ('qr'.indexOf(dir) >= 0) {
      this.drawSide4(cvs, dir, score);
    }
  }
}
