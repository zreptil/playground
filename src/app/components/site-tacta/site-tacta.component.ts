import {Component} from '@angular/core';
import {MessageService} from '@/_services/message.service';
import {TactaCardComponent} from '@/controls/tacta-card/tacta-card.component';
import {Player, TactaService} from '@/_services/tacta.service';
import {Utils} from '@/classes/utils';
import {TactaBoardComponent} from '@/controls/tacta-board/tacta-board.component';
import {GlobalsService} from '@/_services/globals.service';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-site-tacta',
  imports: [
    TactaCardComponent,
    TactaBoardComponent,
    MatIconButton,
    MatIcon,
    MatButton
  ],
  templateUrl: './site-tacta.component.html',
  styleUrl: './site-tacta.component.scss'
})
export class SiteTactaComponent {

  protected readonly Utils = Utils;

  constructor(public msg: MessageService,
              public ts: TactaService,
              public globals: GlobalsService) {
    this.ts.createDeck();
    if (this.ts.players.length === 0) {
      this.ts.createPlayer('Zreptil');
      this.ts.createPlayer('Spieler 1');
    }
    this.ts.activateCurrentPlayer();
  }

  get colorList() {
    return this.ts.colors.filter((c, idx) =>
      idx > 0
      && !this.ts.players.some(p => p.color === c.id)
    );
  }

  score(player: Player) {
    return Utils.plural(player.score, {1: '1 Punkt', other: `${player.score} Punkte`});
  }

  cardCount(player: Player) {
    return Utils.plural(player.cards.length, {1: '1 Karte', other: `${player.cards.length} Karten`});
  }

  styleForColor(color: any, player: Player) {
    const size = (player.cvs[0].cardHeight / this.colorList.length) + 'px';
    return {
      backgroundColor: color.f,
      height: size,
      width: size
    };
  }

  clickColor(evt: PointerEvent, player: Player, color: any) {
    evt.stopPropagation();
    for (const card of this.ts.board) {
      card.changeColor(color.id, player.color);
    }
    const cards: number[] = [];
    for (const card of player.cards) {
      cards.push(card - player.color * 18 + color.id * 18);
    }
    player.cards = cards;
    player.cvs = [];
    player.color = color.id;
    this.ts.refresh.set(!this.ts.refresh());
  }

  protected clickCycle(evt: PointerEvent, player: Player) {
    evt.stopPropagation();
    const cards = [];
    cards.push(player.cards[player.cards.length - 1]);
    for (let i = 0; i < player.cards.length - 1; i++) {
      cards.push(player.cards[i]);
    }
    player.cards = cards;
    player.cvs = [];
  }
}
