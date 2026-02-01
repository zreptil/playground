import {AfterViewInit, Component, effect, ElementRef, HostListener, Input, signal, ViewChild} from '@angular/core';
import {CardConfig, GameConfig, TactaService} from '@/_services/tacta.service';
import {TactaCanvas, TactaCardService} from '@/_services/tacta-card.service';
import {GLOBALS} from '@/_services/globals.service';

@Component({
  selector: 'app-tacta-board',
  imports: [],
  templateUrl: './tacta-board.component.html',
  styleUrl: './tacta-board.component.scss'
})
export class TactaBoardComponent implements AfterViewInit {
  @Input()
  game: GameConfig;

  @ViewChild('canvas', {static: false})
  canvasRef!: ElementRef<HTMLCanvasElement>;
  refresh = signal<boolean>(false);
  cvs: TactaCanvas;
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
      if (this.cvs != null) {
        this.tcs.drawCard(this.cvs);
      }
    });
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = this.host.nativeElement.parentElement.getBoundingClientRect()
    canvas.width = rect.width;
    canvas.height = rect.height;
    this.ctx = canvas.getContext('2d')!;
    this.xMid = canvas.width / 2;
    this.yMid = canvas.height / 2;
    this.cvs = this.ts.createTactaCanvas({...this, scale: 2});
    this.clearBoard();
    this.tcs.drawCard(this.cvs);
  }

  findArea(cvs: TactaCanvas, x: number, y: number, fullCard = false): TactaCanvas {
    let ret: TactaCanvas;

    if (fullCard) {
      if (cvs.cardIdx !== 0 && this.ctx.isPointInPath(cvs.cardRect, x, y) && cvs.cards.length === 0) {
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

  normalizeCardIdx(cardIdx: number) {
    return cardIdx > 127 ? cardIdx - 128 : cardIdx;
  }

  removeCard(cvs: TactaCanvas, cardIdx: number) {
    for (let i = 0; i < cvs.cards.length; i++) {
      if (this.normalizeCardIdx(cvs.cards[i].cardIdx) === this.normalizeCardIdx(cardIdx)) {
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

  @HostListener('wheel', ['$event'])
  onWheel(evt: WheelEvent) {
    CardConfig.scale = Math.max(0.5, Math.min(5, CardConfig.scale + Math.sign(evt.deltaY) * 0.1));
    this.scaleCvs(this.cvs);
    this.clearBoard();
    this.tcs.drawCard(this.cvs);
  }

  scaleCvs(cvs: TactaCanvas) {
    this.ts.adjustDimensions(cvs, {
      cardWidth: CardConfig.defWidth * CardConfig.scale,
      cardHeight: CardConfig.defHeight * CardConfig.scale,
      cardBorder: CardConfig.defBorder * CardConfig.scale
    });
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(evt: MouseEvent) {
    if (this.xDown != null && this.yDown != null) {
      const canvas = this.canvasRef.nativeElement;
      this.cvs.xOrg = Math.min(Math.max(0, this.xCvs + evt.clientX - this.xDown), canvas.width - this.cvs.cardWidth);
      this.cvs.yOrg = Math.min(Math.max(0, this.yCvs + evt.clientY - this.yDown), canvas.height - this.cvs.cardHeight);
      this.clearBoard();
      this.tcs.drawCard(this.cvs);
      return;
    }
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
  onMouseDown(evt: MouseEvent) {
    if (this.currentArea == null) {
      this.xDown = evt.clientX;
      this.yDown = evt.clientY;
      this.xCvs = this.cvs.xOrg ?? 0;
      this.yCvs = this.cvs.yOrg ?? 0;
      return;
    }
    if (this.currentArea.isMarked) {
      const player = this.ts.players.find(p => p.color === Math.floor((this.normalizeCardIdx(this.currentArea.cardIdx) - 1) / 18));
      if (player != null) {
        player.cards.push(this.currentArea.cardIdx);
        this.removeCard(this.cvs, this.currentArea.cardIdx);
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
  onMouseUp(evt: MouseEvent) {
    this.xDown = null;
    this.yDown = null;
  }

  protected onCanvasClick(evt: PointerEvent) {
    evt.stopPropagation();
  }
}
