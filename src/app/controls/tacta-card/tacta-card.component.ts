import {AfterViewInit, Component, effect, ElementRef, input, Input, signal, ViewChild} from '@angular/core';
import {CardConfig, GameConfig, TactaService} from '@/_services/tacta.service';
import {GLOBALS} from '@/_services/globals.service';
import {TactaCanvas, TactaCardService} from '@/_services/tacta-card.service';

@Component({
  selector: 'app-tacta-card',
  host: {
    '[style.width.px]': 'cvs?.cardWidth',
    '[style.height.px]': 'cvs?.cardHeight',
    '[style.display]': '"block"'
  },
  imports: [],
  templateUrl: './tacta-card.component.html',
  styleUrl: './tacta-card.component.scss'
})
export class TactaCardComponent implements AfterViewInit {
  @ViewChild('canvas', {static: false})
  canvasRef!: ElementRef<HTMLCanvasElement>;
  // @Input()  game: GameConfig;
  game = input<GameConfig>(null)
  lastCardIdx: number = null;

  @Input()
  info: string;

  @Input()
  cardStyle: any;
  cvs: TactaCanvas;

  refresh = signal<boolean>(false);
  initialized = false;
  private ctx!: CanvasRenderingContext2D;

  constructor(public ts: TactaService,
              public tcs: TactaCardService) {
    effect(() => {
      // GLOBALS.isDebug needs to be accessed to activate effect on changes
      GLOBALS.isDebug;
      const test = this.ts.markedCanvas();
      if (this.initialized && this.lastCardIdx != this.game()?.cardIdx) {
        this.updateGame();
      }
      this.refresh();
      if (this.cvs != null) {
        this.tcs.drawCard(this.cvs);
      }
    });
  }

  // get styleForDiv(): any {
  //   return {
  //     width: `${this.cvs?.config?.width}px`,
  //     height: `${this.cvs?.config?.height}px`,
  //     ...this.cardStyle
  //   };
  // }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    setTimeout(() => {
      this.updateGame();
      this.initialized = true;
    });
  }

  updateGame() {
    this.cvs = this.ts.createTactaCanvas({
      ctx: this.ctx,
      cardWidth: CardConfig.defWidth * 2,
      cardHeight: CardConfig.defHeight * 2,
      cardBorder: CardConfig.defBorder * 2,
      game: this.game()
    });
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.cvs.cardWidth;
    canvas.height = this.cvs.cardHeight;
    this.lastCardIdx = this.game().cardIdx;
    this.tcs.drawCard(this.cvs);
  }

  onCanvasClick(evt: PointerEvent) {
    const area = this.areaForPos(evt);
    if (area == null) {
      const oldIdx = this.cvs.cardIdx;
      if (this.cvs.cardIdx >= 128) {
        this.cvs.cardIdx -= 128;
      } else {
        this.cvs.cardIdx += 128;
      }
      for (const player of this.ts.players) {
        for (let i = 0; i < player.cards.length; i++) {
          if (player.cards[i] === oldIdx) {
            player.cards[i] = this.cvs.cardIdx;
          }
        }
      }
      this.ts.clearMarkedAreas();
      this.ts.markedCanvas.set(null);
    } else {
      this.ts.clearMarkedAreas();
      this.cvs.markedAreas = area;
      this.ts.markedCanvas.set(this.cvs);
    }
    this.refresh.set(!this.refresh());
  }

  areaForPos(evt: PointerEvent | MouseEvent): string {
    const canvas = this.canvasRef.nativeElement;

    const rect = canvas.getBoundingClientRect();
    let x = evt.clientX - rect.left;
    let y = evt.clientY - rect.top;

    const transform = getComputedStyle(canvas).transform;

    if (transform && transform !== 'none') {
      const inverse = new DOMMatrix(transform).inverse();
      const point = new DOMPoint(x, y).matrixTransform(inverse);

      x = point.x;
      y = point.y;
    }

    for (const key of Object.keys(this.cvs.paths)) {
      if (this.ctx.isPointInPath(this.cvs.paths[key], x, y)) {
        return key;
      }
    }
    return null;
  }
}
