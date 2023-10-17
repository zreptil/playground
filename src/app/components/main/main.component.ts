import {Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {SyncService} from '@/_services/sync/sync.service';
import {MessageService} from '@/_services/message.service';
import {WhatsNewComponent} from '@/components/whats-new/whats-new.component';
import {ImpressumComponent} from '@/components/impressum/impressum.component';
import {WelcomeComponent} from '@/components/welcome/welcome.component';
import {LanguageService} from '@/_services/language.service';
import {LangData} from '@/_model/lang-data';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  constructor(public globals: GlobalsService,
              public sync: SyncService,
              public ms: MessageService,
              public ls: LanguageService) {
  }

  togglePrimeNumbers(): void {
    GLOBALS.siteConfig.showPrimeNumbers = !GLOBALS.siteConfig.showPrimeNumbers;
    GLOBALS.saveSharedData();
  }

  clickSave(evt: MouseEvent) {
    evt.stopPropagation();
    GLOBALS.saveSharedData();
  }

  clickDebug(evt: MouseEvent) {
    evt.stopPropagation();
    GLOBALS.isDebug = !GLOBALS.isDebug;
  }

  clickWhatsNew() {
    this.ms.showPopup(WhatsNewComponent, 'whatsnew', null);
  }

  clickImpressum() {
    this.ms.showPopup(ImpressumComponent, 'impressum', null);
  }

  clickWelcome() {
    this.ms.showPopup(WelcomeComponent, 'welcome', null);
  }

  languageClass(item: LangData): string[] {
    const ret = ['themelogo'];
    if (GLOBALS.language != null && item.code === GLOBALS.language.code) {
      ret.push('currLang');
    }
    return ret;
  }

  clickLanguage(item: LangData) {
    GLOBALS.language = item;
    GLOBALS.saveWebData();
    location.reload();
  }
}
