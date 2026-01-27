import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {CardConfig, GameConfig, TactaService} from '@/_services/tacta.service';

@Component({
  selector: 'app-tacta-card',
  imports: [],
  templateUrl: './tacta-card.component.html',
  styleUrl: './tacta-card.component.scss'
})
export class TactaCardComponent implements AfterViewInit {
  @ViewChild('canvas', {static: false})
  canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input()
  game: GameConfig;
  private ctx!: CanvasRenderingContext2D;

  constructor(public ts: TactaService) {
  }

  get config(): CardConfig {
    return this.ts.deck[this.game.cardIdx] ?? new CardConfig();
  }

  get styleForDiv(): any {
    return {
      width: `${this.config?.width}px`,
      height: `${this.config?.height}px`
    };
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.config.width;
    canvas.height = this.config.height;
    this.ctx = canvas.getContext('2d')!;
    this.drawCard();
  }

  drawPath(dir: string, points: number[][], score: string, lw = this.config.border): void {
    this.ctx.beginPath();
    this.ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      this.ctx.lineTo(p[0], p[1]);
    }
    this.ctx.closePath();
    this.ctx.lineWidth = lw;
    this.ctx.strokeStyle = 'white';
    if (score !== '0') {
      this.ctx.fillStyle = this.config.color;
      this.ctx.fill();
    }
    this.ctx.stroke();

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
      this.ctx.beginPath();
      let xm = 0;
      let ym = 0;
      for (const p of points) {
        xm += p[0];
        ym += p[1];
      }
      xm = xm / points.length;
      ym = ym / points.length;
      const bw = this.config.border;
      let dx: number;
      let dy: number;
      const size = this.config.border * 2;
      switch (score) {
        case '+':
          this.centerText(dir, xm, ym);
          break;
        case '1':
          this.ctx.arc(xm, ym, size, 0, Math.PI * 2);
          break;
        case '2':
          dx = this.config.width / 12 + bw / 2;
          dy = dx;
          if (xm > this.config.width / 2) {
            dy = -dy;
          }
          if (ym > this.config.height / 2) {
            dx = -dx;
          }
          this.ctx.arc(xm + dx, ym + dy, size, 0, Math.PI * 2);
          this.ctx.arc(xm - dx, ym - dy, size, 0, Math.PI * 2);
          break;
        case '3':
          this.ctx.arc(xm, ym, size, 0, Math.PI * 2);
          dx = this.config.width / 4 + bw / 2;
          dy = 0;
          if (ym === this.config.height / 2) {
            dy = dx;
            dx = 0;
          }
          this.ctx.arc(xm + dx, ym + dy, size, 0, Math.PI * 2);
          this.ctx.arc(xm - dx, ym - dy, size, 0, Math.PI * 2);
          break;
        case '4':
          dy = (this.config.height - bw * 3) / 5;
          ym -= dy * 1.5;
          for (let i = 0; i < 4; i++) {
            this.ctx.arc(xm, ym + dy * i, size, 0, Math.PI * 2);
          }
          break;
      }
      this.ctx.fillStyle = 'white';
      this.ctx.fill();
    }
  }

  drawCorner3(dir: string, score = '') {
    const bw = this.config.border;
    const x = bw / 2;
    const y = bw / 2;
    const cw = this.config.width - bw;
    const ch = this.config.height - bw;
    const w = cw / 2 - bw * 2;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    switch (dir) {
      case 'a':
        this.drawPath(dir, [
          [x + bw, y + bw],
          [x + bw + w, y + bw],
          [x + bw, y + bw + w]], score);
        break;
      case 'b':
        this.drawPath(dir, [
          [x + cw - bw, y + bw],
          [x + cw - bw - w, y + bw],
          [x + cw - bw, y + bw + w]], score);
        break;
      case 'c':
        this.drawPath(dir, [
          [x + cw - bw, y + ch - bw],
          [x + cw - bw - w, y + ch - bw],
          [x + cw - bw, y + ch - bw - w]], score);
        break;
      case 'd':
        this.drawPath(dir, [
          [x + bw, y + ch - bw],
          [x + bw + w, y + ch - bw],
          [x + bw, y + ch - bw - w]], score);
        break;
    }
  }

  drawCorner4(dir: string, score = '') {
    const bw = this.config.border;
    const x = bw / 2;
    const y = bw / 2;
    const cw = this.config.width;
    const ch = this.config.height;
    const w = cw / 2 - bw;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    switch (dir) {
      case 'e':
        this.drawPath(dir, [
          [x + bw, y + bw], [x + w, y + bw],
          [x + w, y + w], [x + bw, y + w]
        ], score);
        break;
      case 'f':
        this.drawPath(dir, [
          [x + cw / 2, y + bw], [x + cw - bw * 2, y + bw],
          [x + cw - bw * 2, y + w], [x + cw / 2, y + w]
        ], score);
        break;
      case 'g':
        this.drawPath(dir, [
          [x + cw / 2, y + ch - w - bw], [x + cw - bw * 2, y + ch - w - bw],
          [x + cw - bw * 2, y + ch - bw * 2], [x + cw / 2, y + ch - bw * 2]
        ], score);
        break;
      case 'h':
        this.drawPath(dir, [
          [x + bw, y + ch - w - bw], [x + w, y + ch - w - bw],
          [x + w, y + ch - bw * 2], [x + bw, y + ch - bw * 2]
        ], score);
        break;
    }
  }

  drawEdge3(dir: string, score = '') {
    const bw = this.config.border;
    const x = this.config.width / 2;
    const y = bw / 2 + bw;
    const cw = this.config.width - bw;
    const w = cw / 2 - bw * 2;
    const dx = Math.sqrt(w * w + w * w) / 2;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    switch (dir) {
      case 'i':
        this.drawPath(dir, [
          [x - dx, y],
          [x + dx, y],
          [x, y + dx]], score);
        break;
      case 'j':
        this.drawPath(dir, [
          [x + w + bw, this.config.height / 2 - dx],
          [x + w + bw, this.config.height / 2 + dx],
          [x + w + bw - dx, this.config.height / 2]], score);
        break;
      case 'k':
        this.drawPath(dir, [
          [x - dx, y + this.config.height - 3 * bw],
          [x + dx, y + this.config.height - 3 * bw],
          [x, y + this.config.height - 3 * bw - dx]], score);
        break;
      case 'l':
        this.drawPath(dir, [
          [x - w - bw, this.config.height / 2 - dx],
          [x - w - bw, this.config.height / 2 + dx],
          [x - w - bw + dx, this.config.height / 2]], score);
        break;
    }
  }

  drawEdge4(dir: string, score = '') {
    const bw = this.config.border;
    const xm = this.config.width / 2;
    const ym = this.config.height / 2;
    let x = bw + bw / 2;
    let y = bw + bw / 2;
    const cw = this.config.width - 3 * bw;
    const ch = (this.config.height - 2 * bw) / 7;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    switch (dir) {
      // @ts-ignore
      case 'o':
        y = y + this.config.height - 3 * bw - ch;
      // fallthrough
      case 'm':
        this.drawPath(dir, [
          [xm - cw / 2, y], [xm + cw / 2, y],
          [xm + cw / 2, y + ch], [xm - cw / 2, y + ch]
        ], score);
        break;
      // @ts-ignore
      case 'n':
        x = x + this.config.width - 3 * bw - ch;
      // fallthrough
      case 'p':
        this.drawPath(dir, [
          [x, ym - cw / 2], [x, ym + cw / 2],
          [x + ch, ym + cw / 2], [x + ch, ym - cw / 2]
        ], score);
        break;
    }
  }

  drawSide4(dir: string, score = '') {
    const bw = this.config.border;
    const xm = this.config.width / 2;
    const ym = this.config.height / 2;
    let x = bw + bw / 2;
    let y = bw + bw / 2;
    const cw = this.config.height - 3 * bw;
    const ch = (this.config.height - 2 * bw) / 7;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    switch (dir) {
      // @ts-ignore
      case 'q':
        x = x + this.config.width - 3 * bw - ch;
      // fallthrough
      case 'r':
        this.drawPath(dir, [
          [x, ym - cw / 2], [x + ch, ym - cw / 2],
          [x + ch, ym + cw / 2], [x, ym + cw / 2]
        ], score);
        break;
    }
  }

  drawCard(): void {
    const bw = this.config.border;
    let x = bw / 2;
    let y = bw / 2;
    let w = this.config.width - bw;
    let h = this.config.height - bw;
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(x + bw, y + bw, w - bw * 2, h - bw * 2);

    // this.ctx.lineWidth = 1;
    // this.ctx.strokeStyle = 'yellow';
    // this.ctx.rect(x, y, w, h);
    // this.ctx.moveTo(x + w / 2, y);
    // this.ctx.lineTo(x + w / 2, y + h);
    // this.ctx.stroke();

    // this.drawArea('a0');
    // this.drawArea('b0');
    // this.drawArea('c0');
    // this.drawArea('d0');
    // this.drawArea('e0');
    // this.drawArea('f0');
    // this.drawArea('g0');
    // this.drawArea('h0');
    // this.drawArea('i0');
    // this.drawArea('j0');
    // this.drawArea('k0');
    // this.drawArea('l0');
    // this.drawArea('m3');
    // this.drawArea('n3');
    // this.drawArea('o3');
    // this.drawArea('p3');
    // this.drawArea('q4');
    // this.drawArea('r4');

    let score = 0;
    for (let i = 0; i < this.config.areas.length; i += 2) {
      const area = this.config.areas.substring(i, i + 2);
      const tmp = parseInt(area.substring(1));
      score += isNaN(tmp) ? 0 : tmp;
      this.drawArea(area);
    }
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, w, h, bw * 2);
    this.ctx.strokeStyle = this.config.color;
    this.ctx.lineWidth = bw;
    this.ctx.stroke();

    this.ctx.beginPath();
    x += bw;
    y += bw;
    w -= bw * 2;
    h -= bw * 2;
    this.ctx.roundRect(x, y, w, h, bw);
    this.ctx.strokeStyle = 'white';
    this.ctx.stroke();

    const xm = this.config.width / 2;
    const ym = this.config.height / 2;
    const size = this.config.border * 3.5;
    this.ctx.fillStyle = this.config.color;
    this.ctx.strokeStyle = 'white';
    switch (this.config.suite) {
      case 0:
        this.ctx.beginPath();
        this.ctx.arc(xm, ym, size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.arc(xm, ym, size - this.config.border / 3, 0, Math.PI * 2);
        this.ctx.lineWidth = this.config.border / 3;
        this.ctx.stroke();
        break;
      case 3:
        this.drawPath('', [
          [xm - size, ym + size * 0.6],
          [xm + size, ym + size * 0.6],
          [xm, ym - size],
        ], '5', this.config.border / 2);
        break;
      case 4:
        this.drawPath('', [
          [xm - size, ym - size],
          [xm + size, ym - size],
          [xm + size, ym + size],
          [xm - size, ym + size],
        ], '5', this.config.border / 2);
        break;
    }

    this.centerText(score > 0 ? `${score}` : 'X', xm, ym);
  }

  centerText(text: string, x: number, y: number) {
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = `bold ${CardConfig.scale * 24 / 5}px Verdana`;
    this.ctx.fillStyle = 'white';
    const metrics = this.ctx.measureText(text);
    const textHeight =
      metrics.actualBoundingBoxAscent +
      metrics.actualBoundingBoxDescent;
    y += (metrics.actualBoundingBoxAscent - textHeight / 2);
    this.ctx.fillText(text, x, y);
  }

  drawArea(area: string): void {
    const dir = area.substring(0, 1);
    const score = area.substring(1);
    if ('abcd'.indexOf(dir) >= 0) {
      this.drawCorner3(dir, score);
    }
    if ('efgh'.indexOf(dir) >= 0) {
      this.drawCorner4(dir, score);
    }
    if ('ijkl'.indexOf(dir) >= 0) {
      this.drawEdge3(dir, score);
    }
    if ('mnop'.indexOf(dir) >= 0) {
      this.drawEdge4(dir, score);
    }
    if ('qr'.indexOf(dir) >= 0) {
      this.drawSide4(dir, score);
    }
  }

  styleForLinked(parentLink: string): any {
    const link = this.ts.connectors[parentLink];
    return {
      'position': 'absolute',
      'transform': `translate(${link.x}%, ${link.y}%) rotate(${link.deg}deg)`
    };
  }
}
