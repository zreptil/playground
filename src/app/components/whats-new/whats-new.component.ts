import {AfterViewInit, Component} from '@angular/core';
import {GLOBALS} from '@/_services/globals.service';

@Component({
  selector: 'app-whats-new',
  templateUrl: './whats-new.component.html',
  styleUrls: ['./whats-new.component.scss']
})
export class WhatsNewComponent implements AfterViewInit {

  checkId = +GLOBALS.version.replace('.', '');

  constructor() {
  }

  get originUrl(): string {
    return location.origin.replace(/\/$/, '');
  }

  classFor(id: number): string[] {
    const ret: string[] = [];
    if (id !== +this.checkId) {
      // ret.push('hidden');
    }
    return ret;
  }

  ngAfterViewInit(): void {
  }

  click(id: number): void {
    this.checkId = id;
  }
}
