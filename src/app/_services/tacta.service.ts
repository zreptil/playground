import {Injectable} from '@angular/core';

export class CardConfig {
  static scale = 5;
  color: string;
  suite: number;
  width?: number;
  height?: number;
  border?: number;
  areas: string;

  linkedCards: { card: CardConfig, link: any }[] = [];

  connect(card: CardConfig, link: any) {
    if (link == null) {
      console.log('link is null', this, card);
      return;
    }
    this.linkedCards.push({card: card, link: link});
  }
}

export class GameConfig {
  linkedCards: GameConfig[] = [];

  constructor(public cardIdx: number,
              public parentLink?: string) {
  }
}

@Injectable({
  providedIn: 'root'
})
export class TactaService {
  colors: any = {
    0: '#000',
    1: '#e59739',
    2: '#da3925',
    3: '#df3ec0',
    4: '#4535d4',
    5: '#77b4f8',
    6: '#8adb5a'
  };
  connectors: any = {
    ai: {x: 14, y: -84, deg: -135},
    ia: {x: -71, y: -67, deg: -225},
    aj: {x: 96, y: 10, deg: -45},
    ja: {x: -59, y: -56, deg: 45},
    ka: {x: -73, y: -65, deg: -45},
    la: {x: -57, y: -57, deg: 225},
    ib: {x: 71, y: -66, deg: 225},
    jb: {x: 57, y: -57, deg: 135},
    kb: {x: 69, y: -69, deg: 45},
    ak: {x: -14, y: 85, deg: 45},
    al: {x: -96, y: -10, deg: 135},
    bi: {x: -14, y: -85, deg: 135},
    bj: {x: 96, y: -10, deg: -135},
    bk: {x: 14, y: 85, deg: -45},
    bl: {x: -96, y: 10, deg: 45},
    ci: {x: 14, y: -85, deg: 45},
    cj: {x: 96, y: 10, deg: 135},
    ck: {x: -14, y: 85, deg: 225},
    cl: {x: -96, y: -10, deg: -45},
    di: {x: -14, y: -85, deg: -45},
    dj: {x: 96, y: -10, deg: 45},
    dk: {x: 14, y: 85, deg: 135},
    dl: {x: -96, y: 10, deg: -135},
    ee: {x: -50, y: -64, deg: 180},
    ef: {x: 69, y: -50, deg: -90},
    eg: {x: 50, y: 64, deg: 0},
    eh: {x: -69, y: 50, deg: 90},
    ff: {x: 48, y: -64, deg: 180},
    fg: {x: 69, y: 50, deg: -90},
    fh: {x: -50, y: 64, deg: 0},
    gg: {x: -70, y: 50, deg: -90},
    gh: {x: -50, y: -64, deg: 0},
    hh: {x: -50, y: 64, deg: 180},
    mm: {x: 0, y: -82, deg: 180},
    mn: {x: 96, y: 0, deg: 270},
    mo: {x: 0, y: 82, deg: 0},
    mp: {x: -95, y: 0, deg: 90},
    no: {x: 0, y: 82, deg: -90},
    oo: {x: 0, y: 82, deg: 180},
    op: {x: -95, y: 0, deg: -90},
    rr: {x: -76, y: 0, deg: 180},
    rq: {x: 76, y: 0, deg: 0},
    qq: {x: 76, y: 0, deg: 180},
    lb: {x: 57, y: -57, deg: -45},
    ic: {x: 72, y: 67, deg: -45},
    jc: {x: -59, y: 57, deg: -45},
    kc: {x: 72, y: 67, deg: 135},
    lc: {x: 60, y: 56, deg: 45},
    id: {x: -73, y: 66, deg: 45},
    jd: {x: -59, y: 56, deg: -45},
    kd: {x: -72, y: 67, deg: -135},
    ld: {x: -58, y: 56, deg: 135},
    fe: {x: -70, y: -50, deg: 90},
    ge: {x: -50, y: -64, deg: 0},
    he: {x: -70, y: -50, deg: -90},
    gf: {x: 70, y: -50, deg: 90},
    hf: {x: 50, y: -64, deg: 0},
    hg: {x: 70, y: 50, deg: 90},
    nm: {x: 0, y: -68, deg: 90},
    om: {x: 0, y: -82, deg: 0},
    pm: {x: 0, y: -68, deg: -90},
    on: {x: 96, y: 0, deg: 90},
    po: {x: 0, y: 68, deg: 90},
    qr: {x: -76, y: 0, deg: 0},
  };
  deck: CardConfig[];

  games: GameConfig[];

  card(data: any) {
    const ret = new CardConfig();
    ret.color = this.colors[data.color ?? 0];
    ret.width = (data.width ?? 64) * CardConfig.scale;
    ret.height = (data.height ?? 89) * CardConfig.scale;
    ret.border = (data.border ?? 1.5) * CardConfig.scale;
    ret.suite = data.suite ?? 0;
    ret.areas = data.areas ?? 'a0b0c0d0e0f0g0h0i0j0k0l0m0n0o0p0q0r0';
    return ret;
  }

  createDeck() {
    CardConfig.scale = 3;
    this.deck = [
      this.card({color: 0, suite: 4}),
      this.card({color: 1, suite: 3, areas: 'a0d0q4'}),
      this.card({color: 0, suite: 0, areas: 'e+f+g+h+'}),
      this.card({color: 0, suite: 3, areas: 'i+j+k+l+'}),
      this.card({color: 0, suite: 4, areas: 'm+n+o+p+'}),
      this.card({color: 0, suite: 4, areas: 'q+r+'})
    ];

    this.games = [
      new GameConfig(0),
      // new GameConfig(this.deck.length - 5),
      // new GameConfig(this.deck.length - 4),
      // new GameConfig(this.deck.length - 3),
      // new GameConfig(this.deck.length - 2),
      // new GameConfig(this.deck.length - 1),
    ];

    this.games[0].linkedCards.push(new GameConfig(1, 'ai'));
    this.games[0].linkedCards.push(new GameConfig(1, 'dk'));
    console.log(JSON.stringify(this.games));
    // 000--[001ai[]001dk[]]
    // this.deck.push(new CardConfig({color: 'black', suite: 3, areas: 'e+f+g+h+'}));
    // this.deck.push(new CardConfig({color: 'black', suite: 3, areas: 'i+j+k+l+'}));
    // this.deck.push(new CardConfig({color: 'black', suite: 3, areas: 'm+n+o+p+'}));
    // this.deck.push(new CardConfig({color: 'black', suite: 3, areas: 'q+r+'}));
    // this.deck[0].connect(new CardConfig({color: '#d04f94', suite: 3, areas: 'c1i1l0'}), this.connectors['ci']);
    // this.deck[0].linkedCards[0].card.connect(
    //   new CardConfig({color: '#88c056', suite: 3, areas: 'i+'}), this.connectors['ib']
    // );
    /*
        this.deck[0].connect(new CardConfig({color: '#e4aa42', suite: 4, areas: 'd1e2j0'}), this.connectors['ee']);
        this.deck[0].connect(new CardConfig({color: '#e4aa42', suite: 4, areas: 'd1e2j0'}), this.connectors['ef']);
        this.deck[0].connect(new CardConfig({color: '#e4aa42', suite: 4, areas: 'd1e2j0'}), this.connectors['eg']);
        this.deck[0].connect(new CardConfig({color: '#e4aa42', suite: 4, areas: 'd1e2j0'}), this.connectors['eh']);
    */
  }
}
