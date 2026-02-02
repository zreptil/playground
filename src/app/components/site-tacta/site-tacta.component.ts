import {Component} from '@angular/core';
import {MessageService} from '@/_services/message.service';
import {TactaCardComponent} from '@/controls/tacta-card/tacta-card.component';
import {Player, TactaService} from '@/_services/tacta.service';
import {Utils} from '@/classes/utils';
import {TactaBoardComponent} from '@/controls/tacta-board/tacta-board.component';
import {GlobalsService} from '@/_services/globals.service';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-site-tacta',
  imports: [
    TactaCardComponent,
    TactaBoardComponent,
    MatIconButton,
    MatIcon
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
    this.ts.createPlayer('Zreptil');
    this.ts.createPlayer('Player 1');
    // this.ts.createPlayer('Player 2');
    // this.ts.createPlayer('Player 3');
    // this.ts.createPlayer('Player 4');
    // this.ts.createPlayer('Player 5');
  }

  score(player: Player) {
    return Utils.plural(player.score, {1: '1 Punkt', other: `${player.score} Punkte`});
  }

  cardCount(player: Player) {
    return Utils.plural(player.cards.length, {1: '1 Karte', other: `${player.cards.length} Karten`});
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
