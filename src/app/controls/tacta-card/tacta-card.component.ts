import {AfterViewInit, Component, effect, ElementRef, input, Input, signal, ViewChild} from '@angular/core';
import {CardConfig, TactaService} from '@/_services/tacta.service';
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
  @ViewChild('canvasHtml', {static: false})
  canvasRef!: ElementRef<HTMLCanvasElement>;
  canvas = input<TactaCanvas>(null)
  lastCardIdx: number = null;
  @Input()
  info: string;
  @Input()
  cardStyle: any;
  refresh = signal<boolean>(false);
  initialized = false;
  private ctx!: CanvasRenderingContext2D;

  constructor(public ts: TactaService,
              public tcs: TactaCardService) {
    effect(() => {
      // GLOBALS.isDebug needs to be accessed to activate effect on changes
      // noinspection JSUnusedLocalSymbols
      const test: any = this.ts.markedCanvas() || GLOBALS.isDebug || this.refresh() || this.ts.refresh();
      if (this.initialized && this.lastCardIdx !== this.cvs.cardIdx) {
        this.updateCanvas();
      } else if (this.cvs != null && this.ctx != null) {
        this.cvs.ctx = this.ctx;
        this.tcs.drawCard(this.cvs);
      }
    });
  }

  get cvs() {
    return this.canvas();
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
    canvas.width = CardConfig.defWidth * 2;
    canvas.height = CardConfig.defHeight * 2;
    this.ctx = canvas.getContext('2d')!;
    setTimeout(() => {
      this.updateCanvas();
      this.initialized = true;
    });
  }

  updateCanvas() {
    this.cvs.ctx = this.ctx;
    this.cvs.cardWidth = CardConfig.defWidth * 2;
    this.cvs.cardHeight = CardConfig.defHeight * 2;
    this.cvs.cardBorder = CardConfig.defBorder * 2;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.cvs.cardWidth;
    canvas.height = this.cvs.cardHeight;
    this.lastCardIdx = this.cvs.cardIdx;
    this.tcs.drawCard(this.cvs);
  }

  onCanvasClick(evt: PointerEvent) {
    let area = this.areaForPos(evt);
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
    } else {
      if (this.cvs.markedAreas === area) {
        area = null;
      }
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
