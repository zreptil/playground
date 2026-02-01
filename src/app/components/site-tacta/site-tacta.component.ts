import {Component} from '@angular/core';
import {MessageService} from '@/_services/message.service';
import {TactaCardComponent} from '@/controls/tacta-card/tacta-card.component';
import {TactaService} from '@/_services/tacta.service';
import {Utils} from '@/classes/utils';
import {TactaBoardComponent} from '@/controls/tacta-board/tacta-board.component';

@Component({
  selector: 'app-site-tacta',
  imports: [
    TactaCardComponent,
    TactaBoardComponent
  ],
  templateUrl: './site-tacta.component.html',
  styleUrl: './site-tacta.component.scss'
})
export class SiteTactaComponent {

  protected readonly Utils = Utils;

  constructor(public msg: MessageService,
              public ts: TactaService) {
    this.ts.createDeck();
    this.ts.createPlayer('Zreptil');
    this.ts.createPlayer('Player 1');
    // this.ts.createPlayer('Player 2');
    // this.ts.createPlayer('Player 3');
    // this.ts.createPlayer('Player 4');
    // this.ts.createPlayer('Player 5');
  }
}
