import {Injectable, signal} from '@angular/core';
import {Utils} from '@/classes/utils';
import {TactaCanvas} from '@/_services/tacta-card.service';

export class Player {
  name: string;
  color: number;
  cards: number[] = [];
  score = 0;
  cvs: TactaCanvas[] = [];
}

export class CardConfig {
  static scale = 1;
  static defWidth = 64;
  static defHeight = 89;
  static defBorder = 1.5;
  colors: { s: string, f: string, sm: string, fm: string, dm: string } = {
    s: '#ffffff', f: '#000000', sm: '#ffff00', fm: '#aaaaaa', dm: '#555555'
  };
  suite: number;
  cardId: number;
  flipped = false;
  linkedCards: { card: CardConfig, link: any }[] = [];

  _areas: string;

  get areas(): string {
    if (!this.flipped) {
      return this._areas ?? '';
    }
    const flips = 'badcfehgilkjmponrq';
    let ret = '';
    for (let i = 0; i < this._areas.length; i += 2) {
      ret += flips[this._areas.charCodeAt(i) - 97] + this._areas[i + 1];
    }
    return ret;
  }

  set areas(value: string) {
    this._areas = value;
  }
}

@Injectable({
  providedIn: 'root'
})
export class TactaService {
  colors: any = {
    0: {s: 'white', f: '#000000', sm: '#ffff00', fm: '#aaaaaa', dm: '#555555'},
    1: {s: 'white', f: '#e59739', sm: '#ffff00', fm: '#aaaaaa', dm: '#555555'},
    2: {s: 'white', f: '#da3925', sm: '#ffff00', fm: '#aaaaaa', dm: '#555555'},
    3: {s: 'white', f: '#df3ec0', sm: '#ffff00', fm: '#aaaaaa', dm: '#555555'},
    4: {s: 'white', f: '#4535d4', sm: '#ffff00', fm: '#aaaaaa', dm: '#555555'},
    5: {s: 'white', f: '#77b4f8', sm: '#ffff00', fm: '#aaaaaa', dm: '#555555'},
    6: {s: 'white', f: '#8adb5a', sm: '#ffff00', fm: '#aaaaaa', dm: '#555555'}
  };
  deck: CardConfig[];
  board: TactaCanvas[];
  players: Player[];
  playerIdx: number = 0;
  connectors: any = {
    ai: {x: 0, y: -22, deg: -135},
    aj: {x: 11, y: 0, deg: -45},
    ak: {x: 0, y: 22, deg: 45},
    al: {x: -11, y: 0, deg: 135},
    bi: {x: 71, y: -73, deg: 135},
    bj: {x: 82, y: 51, deg: -135},
    bk: {x: -70, y: 73, deg: -45},
    bl: {x: -82, y: -51, deg: 45},
    ci: {x: 28, y: -143, deg: 45},
    cj: {x: 180, y: 20, deg: 135},
    ck: {x: -28, y: 143, deg: 225},
    cl: {x: -180, y: -20, deg: -45},
    di: {x: -98, y: -93, deg: -45},
    dj: {x: 109, y: -71, deg: 45},
    dk: {x: 98, y: 93, deg: 135},
    dl: {x: -110, y: 71, deg: -135},
    ee: {x: 0, y: -12, deg: 180},
    ef: {x: 0, y: -12, deg: -90},
    eg: {x: 0, y: 12, deg: 0},
    eh: {x: 0, y: 12, deg: 90},
    fe: {x: 0, y: -84, deg: 90},
    ff: {x: 100, y: -12, deg: 180},
    fg: {x: 0, y: 84, deg: -90},
    fh: {x: -100, y: 12, deg: 0},
    ge: {x: -100, y: -112, deg: 0},
    gf: {x: 137, y: -84, deg: 90},
    gg: {x: 100, y: 112, deg: 180},
    gh: {x: -137, y: 84, deg: -90},
    he: {x: -137, y: -12, deg: -90},
    hf: {x: 0, y: -112, deg: 0},
    hg: {x: 137, y: 12, deg: 90},
    hh: {x: 0, y: 112, deg: 180},
    ia: {x: 13, y: -56, deg: -225},
    ib: {x: 58, y: -5, deg: 225},
    ic: {x: -13, y: 56, deg: -45},
    id: {x: -58, y: 5, deg: 45},
    ja: {x: -44, y: -117, deg: 45},
    jb: {x: 142, y: -46, deg: 135},
    jc: {x: 44, y: 117, deg: -135},
    jd: {x: -142, y: 46, deg: -45},
    ka: {x: -156, y: -75, deg: -45},
    kb: {x: 85, y: -126, deg: 45},
    kc: {x: 156, y: 75, deg: 135},
    kd: {x: -85, y: 126, deg: -135},
    la: {x: -72, y: 5, deg: 225},
    lb: {x: -26, y: -66, deg: -45},
    lc: {x: 72, y: -5, deg: 45},
    ld: {x: 26, y: 66, deg: -225},
    mm: {x: 50, y: -32, deg: 180},
    mn: {x: 24, y: 36, deg: 270},
    mo: {x: -50, y: 32, deg: 0},
    mp: {x: -24, y: -36, deg: 90},
    nm: {x: 69, y: -104, deg: 90},
    no: {x: -69, y: 104, deg: -90},
    om: {x: -50, y: -132, deg: 0},
    on: {x: 163, y: -36, deg: 90},
    oo: {x: 50, y: 132, deg: 180},
    op: {x: -163, y: 36, deg: -90},
    pm: {x: -70, y: -32, deg: -90},
    po: {x: 70, y: 32, deg: 90},
    qq: {x: 125, y: 50, deg: 180},
    qr: {x: -125, y: -50, deg: 0},
    rq: {x: 25, y: -50, deg: 0},
    rr: {x: -25, y: 50, deg: 180}
  };
  cvsList: TactaCanvas[] = [];
  // global signal to refresh all instances of TactaCard
  markedCanvas = signal<TactaCanvas>(null);

  cardOfPlayer(player: Player, id: number, idx: number) {
    if (player.cvs[id] == null) {
      player.cvs[id] = new TactaCanvas({cardIdx: player?.cards?.[idx], turnIdx: -1, scale: 2}, this);
    }
    return player.cvs[id];
  }

  // get gamesAsString(): string {
  //   return this.games?.reduce((a, b) => a + b.asString, '') ?? '';
  // }

  card(data: any) {
    const ret = new CardConfig();
    ret.colors = this.colors[data.color ?? 0];
    ret.suite = data.suite ?? 0;
    ret.areas = data.areas ?? 'a-b-c-d-e-f-g-h-i-j-k-l-m-n-o-p-q-r-';
    ret.cardId = data.cardId ?? this.deck.length;
    return ret;
  }

  addToDeck(src: any) {
    this.deck.push(this.card({...src, cardId: this.deck.length}));
  }

  createDeck() {
    this.deck = [];
    this.addToDeck({color: 0, suite: 4});
    for (let i = 1; i <= 6; i++) {
      this.addToDeck({color: i, suite: 0, areas: 'l1f0o0'});
      this.addToDeck({color: i, suite: 0, areas: 'd1j1e0'});
      this.addToDeck({color: i, suite: 0, areas: 'b0l0o3'});
      this.addToDeck({color: i, suite: 0, areas: 'a0d0q4'});
      this.addToDeck({color: i, suite: 0, areas: 'c1i1p3'});
      this.addToDeck({color: i, suite: 0, areas: 'i1j1l1o3'});
      this.addToDeck({color: i, suite: 3, areas: 'd1e0n0'});
      this.addToDeck({color: i, suite: 3, areas: 'd1i1j0'});
      this.addToDeck({color: i, suite: 3, areas: 'b0k0p3'});
      this.addToDeck({color: i, suite: 3, areas: 'b1l0o3'});
      this.addToDeck({color: i, suite: 3, areas: 'j1r4'});
      this.addToDeck({color: i, suite: 3, areas: 'a1d1q4'});
      this.addToDeck({color: i, suite: 4, areas: 'b1c0p0'});
      this.addToDeck({color: i, suite: 4, areas: 'f2l0o0'});
      this.addToDeck({color: i, suite: 4, areas: 'c1f2l0'});
      this.addToDeck({color: i, suite: 4, areas: 'd0i1n3'});
      this.addToDeck({color: i, suite: 4, areas: 'e2j0o3'});
      this.addToDeck({color: i, suite: 4, areas: 'd0e2q4'});
    }
    this.addToDeck({color: 0, suite: 0, areas: 'a0b0c0d0'});
    this.addToDeck({color: 0, suite: 0, areas: 'e0f0g0h0'});
    this.addToDeck({color: 0, suite: 3, areas: 'i0j0k0l0'});
    this.addToDeck({color: 0, suite: 4, areas: 'm0n0o0p0'});
    this.addToDeck({color: 0, suite: 4, areas: 'q0r0'});
    let src = '';
    let idx = 0;
    for (let i = 0; i < this.deck.length; i++) {
      src += `${Utils.hex(i)}${Utils.hex(idx++)}--[]`;
    }
    // src = '0000--[]6d01--[]6e02--[]6f03--[]7004--[]7105--[]';
    // src = '0000--[6d01ai[]6d02aj[]6d03ak[]6d04al[]]';
    // src = '0000--[6d01bi[]6d02bj[]6d03bk[]6d04bl[]]';
    // src = '0000--[6d01ci[]6d02cj[]6d03ck[]6d04cl[]]';
    // src = '0000--[6d01di[]6d02dj[]6d03dk[]6d04dl[]]';
    // src = '0000--[6e01ee[]6e02ef[]6e03eg[]6e04eh[]]';
    // src = '0000--[6e01fe[]6e02ff[]6e03fg[]6e04fh[]]';
    // src = '0000--[6e01ge[]6e02gf[]6e03gg[]6e04gh[]]';
    // src = '0000--[6e01he[]6e02hf[]6e03hg[]6e04hh[]]';
    // src = '0000--[6f01ia[]6f02ib[]6f03ic[]6f04id[]]';
    // src = '0000--[6f01ja[]6f02jb[]6f03jc[]6f04jd[]]';
    // src = '0000--[6f01ka[]6f02kb[]6f03kc[]6f04kd[]]';
    // src = '0000--[6f01la[]6f02lb[]6f03lc[]6f04ld[]]';
    // src = '0000--[7001mm[]7002mn[]7003mo[]7004mp[]]';
    // src = '0000--[7001nm[]7002no[]]';
    // src = '0000--[7001om[]7002on[]7003oo[]7004op[]]';
    // src = '0000--[7001pm[]7002po[]]';
    // src = '0000--[7101qq[]7102qr[]]';
    // src = '0000--[7101rq[]7102rr[]]';
    src = '0000--[]';
    this.board = [];
    TactaCanvas.fromString(src, this.board, this);
  }

  createPlayer(name: string, color = -1, cards: number[] = null) {
    this.players ??= [];
    let start: number;
    const colors = [];
    if (color < 0 || this.players.some(p => p.cards.includes((color + 1) * 18))) {
      // collect colors not given to any player
      for (let i = 1; i < 7; i++) {
        if (!this.players.some(p => p.cards.includes(i * 18))) {
          colors.push(i - 1);
        }
      }
      // pick one color
      start = colors[Math.floor(Math.random() * colors.length)] * 18 + 1;
    } else {
      start = color * 18 + 1;
    }
    const player = new Player();
    player.name = name;
    player.color = Math.floor(start / 18);
    player.cards = cards ?? Utils.randomNumbers(18, start);
    this.players.push(player);
  }

  createTactaCanvas(src: any) {
    const ret = new TactaCanvas(src, this);
    this.cvsList.push(ret);
    return ret;
  }

  clearMarkedAreas() {
    for (const cvs of this.cvsList) {
      cvs.markedAreas = '';
    }
    for (const player of this.players) {
      for (const key of Object.keys(player.cvs)) {
        player.cvs[+key].markedAreas = '';
      }
    }
    this.markedCanvas.set(null);
  }

  adjustDimensions(cvs: TactaCanvas, values: any) {
    cvs.cardWidth = values.cardWidth;
    cvs.cardHeight = values.cardHeight;
    cvs.cardBorder = values.cardBorder;
    for (const card of cvs.cards) {
      this.adjustDimensions(card, values);
    }
  }

  moveMarkedToBoard(cvs: TactaCanvas, dst: TactaCanvas) {
    const src = this.markedCanvas();
    if (src == null || dst == null) {
      return;
    }
    src.parentLink = `${src.markedAreas}${dst.markedAreas}`;
    src.ctx = cvs.ctx;
    src.cardWidth = cvs.cardWidth;
    src.cardHeight = cvs.cardHeight;
    src.cardBorder = cvs.cardBorder;
    src.turnIdx = this.highestTurn(cvs) + 1;
    dst.cards.push(src);
    for (const player of this.players) {
      player.cards = player.cards.filter(c => c !== src.cardIdx);
      player.cvs = [];
    }
    this.clearMarkedAreas();
    this.playerIdx = (this.playerIdx + 1) % this.players.length;
    this.calcScore(cvs);
  }

  cardColor(cardIdx: number) {
    return Math.floor((cardIdx - 1) / 18);
  }

  playerForCard(cardIdx: number) {
    const color = Math.floor((this.normalizeCardIdx(cardIdx) - 1) / 18);
    return this.players.find(p => p.color === color);
  }

  normalizeCardIdx(cardIdx: number) {
    return cardIdx > 127 ? cardIdx - 128 : cardIdx;
  }

  calcScore(cvs: TactaCanvas, init = true) {
    if (init) {
      console.log('Auf gehts', cvs);
      for (const player of this.players) {
        player.score = 0;
      }
    }
    const cardIdx = this.normalizeCardIdx(cvs.cardIdx);
    for (let i = 0; i < this.deck[cardIdx].areas.length; i += 2) {
      const id = this.deck[cardIdx].areas.substring(i, i + 1);
      const score = +(this.deck[cardIdx].areas.substring(i + 1, i + 2));
      if (score > 0) {
        if (!cvs.cards.some(c => c.parentLink.endsWith(id))) {
          const p = this.playerForCard(cardIdx);
          if (p != null) {
            p.score += score;
          }
        }
      }
    }
    for (const card of cvs.cards) {
      this.calcScore(card, false);
    }
  }

  highestTurn(cvs: TactaCanvas, max = 0) {
    max = Math.max(max, cvs.turnIdx);
    for (const card of cvs.cards) {
      max = Math.max(max, this.highestTurn(card, max));
    }
    return max;
  }
}
