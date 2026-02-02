import {AfterViewInit, Component, effect, ElementRef, HostListener, input, signal, ViewChild} from '@angular/core';
import {CardConfig, TactaService} from '@/_services/tacta.service';
import {TactaCanvas, TactaCardService} from '@/_services/tacta-card.service';
import {GLOBALS} from '@/_services/globals.service';
import {Utils} from '@/classes/utils';

@Component({
  selector: 'app-tacta-board',
  imports: [],
  templateUrl: './tacta-board.component.html',
  styleUrl: './tacta-board.component.scss'
})
export class TactaBoardComponent implements AfterViewInit {
  @ViewChild('canvasHtml', {static: false})
  canvasRef!: ElementRef<HTMLCanvasElement>;
  refresh = signal<boolean>(false);
  canvas = input<TactaCanvas>(null);
  xMid: number;
  yMid: number;
  xDown: number;
  yDown: number;
  xCvs: number;
  yCvs: number;
  currentCursor: string = 'default';
  private ctx!: CanvasRenderingContext2D;
  private currentArea: TactaCanvas;

  constructor(private host: ElementRef<HTMLElement>,
              public ts: TactaService,
              public tcs: TactaCardService) {
    effect(() => {
      // GLOBALS.isDebug needs to be accessed to activate effect on changes
      GLOBALS.isDebug;
      this.refresh();
      if (this.cvs != null && this.ctx != null) {
        this.cvs.ctx = this.ctx;
        this.tcs.drawCard(this.cvs);
      }
    });
  }

  get cvs() {
    return this.canvas();
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = this.host.nativeElement.parentElement.getBoundingClientRect()
    canvas.width = rect.width;
    canvas.height = rect.height;
    this.ctx = canvas.getContext('2d')!;
    this.xMid = canvas.width / 2;
    this.yMid = canvas.height / 2;
    // this.cvs = this.ts.createTactaCanvas({...this, scale: 2});
    this.cvs.ctx = this.ctx;
    CardConfig.scale = 2;
    this.cvs.cardWidth = CardConfig.defWidth * CardConfig.scale;
    this.cvs.cardHeight = CardConfig.defHeight * CardConfig.scale;
    this.cvs.cardBorder = CardConfig.defBorder * CardConfig.scale;
    this.cvs.xOrg = canvas.width / 2 - this.cvs.cardWidth / 2;
    this.cvs.yOrg = canvas.height / 2 - this.cvs.cardHeight / 2;
    this.clearBoard();
    this.tcs.drawCard(this.cvs);
    Utils.ZoomConfig(
      canvas,
      CardConfig.scale, 0.5, 5,
      (scale) => {
        CardConfig.scale = scale;
        this.ts.adjustDimensions(this.cvs, {
          cardWidth: CardConfig.defWidth * scale,
          cardHeight: CardConfig.defHeight * scale,
          cardBorder: CardConfig.defBorder * scale
        });
        this.clearBoard();
        this.tcs.drawCard(this.cvs);
      }, (_x, _y) => {
        this.xCvs = this.cvs.xOrg;
        this.yCvs = this.cvs.yOrg;
      }, (dx, dy) => {
        const canvas = this.canvasRef.nativeElement;
        this.cvs.xOrg = Math.min(Math.max(0, this.xCvs + dx), canvas.width - this.cvs.cardWidth);
        this.cvs.yOrg = Math.min(Math.max(0, this.yCvs + dy), canvas.height - this.cvs.cardHeight);
        this.clearBoard();
        this.tcs.drawCard(this.cvs);
      }
    );

    // const size = 20;
    // const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    //   <defs>
    //     <pattern id="hatch" patternUnits="userSpaceOnUse" width="${size}" height="${size}">
    //       <rect width="${size}" height="${size}" fill="black"/>
    //       <path d="M ${0} ${size / 2} L ${size} ${size / 2}"
    //       stroke="red" stroke-width="${size / 10}"/>
    //     </pattern>
    //   </defs>
    //   <rect width="${size}" height="${size}" fill="url(#hatch)"/></svg>`;
    // const img = new Image();
    // img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    // img.onload = () => {
    //   const pat = this.ctx.createPattern(img, 'repeat')!;
    //   pat.setTransform(new DOMMatrix().rotate(30));
    //   for (let key of Object.keys(this.ts.colors)) {
    //     this.ts.colors[key].dm = this.ts.colors[key].f;
    //   }
    // };
  }

  findArea(cvs: TactaCanvas, x: number, y: number, fullCard = false): TactaCanvas {
    let ret: TactaCanvas;

    if (fullCard) {
      if (cvs.cardIdx !== 0
        && this.ts.players[this.ts.playerIdx].color === this.ts.cardColor(cvs.cardIdx)
        && this.ctx.isPointInPath(cvs.cardRect, x, y) && cvs.cards.length === 0) {
        return cvs;
      }
    } else {
      for (const key of Object.keys(cvs.paths)) {
        if (this.ctx.isPointInPath(cvs.paths[key], x, y)) {
          // only mark the area when it was not used for connection between cards
          if (!cvs.parentLink.startsWith(key) && !cvs.cards.find(c => c.parentLink.endsWith(key))) {
            // only mark the area when there is a possible connection to this card
            if (this.ts.connectors[this.ts.markedCanvas()?.markedAreas + key] != null) {
              cvs.markedAreas = key;
              return cvs;
            }
          }
        }
      }
    }
    for (const card of cvs.cards) {
      ret = this.findArea(card, x, y, fullCard);
      if (ret != null) {
        return ret;
      }
    }
    return ret;
  }

  clearMarkedAreas(cvs: TactaCanvas) {
    cvs.markedAreas = '';
    cvs.isMarked = false;
    for (const card of cvs.cards) {
      this.clearMarkedAreas(card);
    }
  }

  removeCard(cvs: TactaCanvas, cardIdx: number) {
    for (let i = 0; i < cvs.cards.length; i++) {
      if (this.ts.normalizeCardIdx(cvs.cards[i].cardIdx) === this.ts.normalizeCardIdx(cardIdx)) {
        cvs.cards.splice(i, 1);
      } else {
        this.removeCard(cvs.cards[i], cardIdx);
      }
    }
  }

  clearBoard() {
    const canvas = this.canvasRef.nativeElement;
    this.cvs.ctx.rect(0, 0, canvas.width, canvas.height);
    this.cvs.ctx.fillStyle = 'aquamarine';
    this.cvs.ctx.fill();
  }

  // @HostListener('wheel', ['$event'])
  // onWheel(evt: WheelEvent) {
  //   CardConfig.scale = Math.max(0.5, Math.min(5, CardConfig.scale + Math.sign(evt.deltaY) * 0.1));
  //   this.scaleCvs(this.cvs);
  //   this.clearBoard();
  //   this.tcs.drawCard(this.cvs);
  // }

  @HostListener('mousemove', ['$event'])
  onMouseMove(evt: MouseEvent) {
    // if (this.xDown != null && this.yDown != null) {
    //   const canvas = this.canvasRef.nativeElement;
    //   this.cvs.xOrg = Math.min(Math.max(0, this.xCvs + evt.clientX - this.xDown), canvas.width - this.cvs.cardWidth);
    //   this.cvs.yOrg = Math.min(Math.max(0, this.yCvs + evt.clientY - this.yDown), canvas.height - this.cvs.cardHeight);
    //   this.clearBoard();
    //   this.tcs.drawCard(this.cvs);
    //   return;
    // }
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.clearMarkedAreas(this.cvs);
    this.currentArea = this.findArea(this.cvs, evt.clientX - rect.x, evt.clientY - rect.y);
    if (this.currentArea == null) {
      this.currentArea = this.findArea(this.cvs, evt.clientX - rect.x, evt.clientY - rect.y, true);
      if (this.currentArea != null) {
        this.clearMarkedAreas(this.cvs);
        this.currentArea.isMarked = true;
        this.currentCursor = 'no-drop';
        this.tcs.drawCard(this.cvs);
        return;
      }
    }
    this.currentCursor = this.currentArea != null ? 'pointer' : 'default';
    this.tcs.drawCard(this.cvs);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(_evt: MouseEvent) {
    // if (this.currentArea == null) {
    //   this.xDown = evt.clientX;
    //   this.yDown = evt.clientY;
    //   this.xCvs = this.cvs.xOrg ?? 0;
    //   this.yCvs = this.cvs.yOrg ?? 0;
    //   return;
    // }
    if (this.currentArea?.isMarked) {
      const playerIdx = this.ts.players.findIndex(p => p.color === Math.floor((this.ts.normalizeCardIdx(this.currentArea.cardIdx) - 1) / 18));
      if (playerIdx >= 0) {
        this.ts.players[playerIdx].cards.push(this.currentArea.cardIdx);
        this.removeCard(this.cvs, this.currentArea.cardIdx);
        this.ts.playerIdx = playerIdx;
      }
      this.currentArea = null;
      this.clearBoard();
      this.tcs.drawCard(this.cvs);
      return;
    }
    this.ts.moveMarkedToBoard(this.cvs, this.currentArea);
    this.currentArea = null;
    this.refresh.set(!this.refresh());
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(_evt: MouseEvent) {
    this.xDown = null;
    this.yDown = null;
  }

  protected onCanvasClick(evt: PointerEvent) {
    evt.stopPropagation();
  }
}
