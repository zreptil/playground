import {Component} from '@angular/core';
import {MessageService} from '@/_services/message.service';
import {TactaCardComponent} from '@/controls/tacta-card/tacta-card.component';
import {TactaService} from '@/_services/tacta.service';

@Component({
  selector: 'app-site-tacta',
  imports: [
    TactaCardComponent
  ],
  templateUrl: './site-tacta.component.html',
  styleUrl: './site-tacta.component.scss'
})
export class SiteTactaComponent {

  constructor(public msg: MessageService,
              public ts: TactaService) {
    this.ts.createDeck();
    // this.cards = [
    //   new CardConfig({color: '#d04f94', suite: 3, areas: 'c1i1l0'}),
    //   new CardConfig({color: '#e4aa42', suite: 4, areas: 'c1f2l0'}),
    //   new CardConfig({color: '#6857a5', suite: 4, areas: 'c0i1p3'}),
    //   new CardConfig({color: '#88c056', suite: 0, areas: 'c1i1p3'}),
    // ];
  }
}
