import {Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {GLOBALS} from '@/_services/globals.service';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  isProduction: boolean = false;
  OAUTH2_CLIENT_ID: string = null;
  GOOGLE_API_KEY: string = null;
  DROPBOX_APP_KEY: string = null;
  settingsFilename: string = null;

  urlParams: any = {};

  appType: string;
  appParams: any = {};

  constructor() {
    for (const key of Object.keys(environment)) {
      (this as any)[key] = (environment as any)[key];
    }
    const src = location.search.replace(/^\?/, '').split('&');
    for (const p of src) {
      const parts = p.split('=');
      this.urlParams[parts[0]] = parts[1];
    }
    setTimeout(() => {
      if (this.urlParams['enableDebug'] === 'true') {
        localStorage.setItem(GLOBALS.debugFlag, GLOBALS.debugActive);
        location.href = location.origin;
      } else if (this.urlParams['enableDebug'] === 'false') {
        localStorage.removeItem(GLOBALS.debugFlag);
        location.href = location.origin;
      }
    }, 1000);
    const temp = window.location.hash?.substring(1);
    this.appType = temp;
    const pos = this.appType.indexOf('?');
    if (pos > 0) {
      this.appType = temp.substring(0, pos);
      const parts = temp.substring(pos + 1).split('&');
      for (const part of parts) {
        const p = part.split('=');
        if (p.length === 1) {
          this.appParams[p[0]] = true;
        } else if (p.length === 2) {
          this.appParams[p[0]] = decodeURIComponent(p[1]);
        }
      }
    }
  }
}
