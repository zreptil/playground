import {ChangeDetectorRef, Component} from '@angular/core';
import {SyncService} from '@/_services/sync/sync.service';
import {StorageService} from '@/_services/storage.service';
import {EnvironmentService} from '@/_services/environment.service';
import {GLOBALS} from '@/_services/globals.service';
import {LogService} from '@/_services/log.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(ss: StorageService,
              cr: ChangeDetectorRef,
              sync: SyncService,
              public env: EnvironmentService) {
    LogService.cr = cr;
    sync.onSetCredentialsToStorage = (value, _isRefreshing) => {
      GLOBALS.oauth2AccessToken = value;
      GLOBALS.saveWebData();
    };
    sync.onGetCredentialsFromStorage = (): string => {
      GLOBALS.loadWebData();
      return GLOBALS.oauth2AccessToken;
    };
    sync.init();
    GLOBALS.loadSharedData();
  }
}
