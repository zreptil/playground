import {Injectable} from '@angular/core';
import {Utils} from '@/classes/utils';
import {GLOBALS} from '@/_services/globals.service';
import {MaterialColorService} from '@/_services/material-color.service';
import * as JSZip from 'jszip';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  static icons: any = {
    back: 'water_drop',
    fore: 'title',
    data: 'edit_note',
    link: 'link'
  }
  readonly currTheme: any = {};
  changed = false;
  colorNames: any = {
    mainHead: $localize`Titel`,
  };

  constructor(public ms: MaterialColorService) {
    window.addEventListener('resize', this.onResize);
    this.onResize();
  }

  get isWatch(): boolean {
    return window.location.href.indexOf('watch') > 0;
  }

  restoreTheme(): void {
    const t = GLOBALS.ownTheme;
    if (t != null) {
      const zip = new JSZip();
      zip.loadAsync(t, {base64: true}).then(packed => {
        packed.file('t').async('string').then(theme => {
          const src = JSON.parse(theme);
          console.log(src);
          for (const key of Object.keys(this.currTheme)) {
            this.currTheme[key] = src[key] ?? this.currTheme[key];
          }
          this.assignStyle(document.body.style, this.currTheme);
          // console.log(JSON.parse(ex));
        });
      });
    }
  }

  storeTheme(): void {
    const list = Object.keys(this.currTheme);
    list.sort();
    let src: any = {};
    for (const key of list) {
      if (this.currTheme[key] != null) {
        src[key] = this.currTheme[key];
      }
    }
    src = JSON.stringify(src);
    GLOBALS.ownTheme = Utils.encodeBase64(src);
    console.log(GLOBALS.ownTheme);
    // const zip = new JSZip();
    // zip.file('t', src);
    // zip.generateAsync({type: 'blob', compression: 'DEFLATE'}).then(blob => {
    //   blob.arrayBuffer().then(buffer => {
    //     GLOBALS.ownTheme = encode(buffer);
    //     this.ds.saveWebData();
    //   });
    //   // saveAs(content, 'colors.zip');
    // });
  }

  onResize() {
    document.body.style.setProperty('--doc-height', `${window.innerHeight}px`);
  }

  async updateWithStandardTheme(theme: any) {
    const std = await GLOBALS.requestJson(`assets/themes/standard/colors.json`);
    for (const key of Object.keys(std)) {
      if (theme[key] == null) {
        theme[key] = std[key];
      }
    }
  }

  async setTheme(name: string) {
    const suffix = this.isWatch ? '-watch' : '';
    document.getElementById('themestyle').setAttribute('href', `assets/themes/${name}/index.css`);
    document.getElementById('favicon').setAttribute('href', `assets/themes/${name}/favicon${suffix}.png`);
    const theme = await GLOBALS.requestJson(`assets/themes/${name}/colors.json`);
    if (theme == null) {
      return;
    }
    // Log.todo('In ThemeService.setTheme könnten die Farben animiert werden, wenn ich rausfinde, wie das durch Veränderung der CSS-Variablen funktioniert.');
    // Versuch einer Farbanimation über Veränderung der Variablen - bisher leider erfolglos
    // if (this.currTheme != null) {
    //   const bodyTag = document.querySelector('body') as HTMLBodyElement;
    //   for (const key of Object.keys(theme)) {
    //     bodyTag.style.removeProperty(`--${key}`);
    //   }
    //   bodyTag.animate([
    //     this.getThemeStyle(this.currTheme),
    //     this.getThemeStyle(theme)
    //   ], {duration: 1000, direction: 'normal', fill: 'forwards'});
    //   console.log(this.getThemeStyle(this.currTheme));
    //   console.log(this.getThemeStyle(theme));
    //   // this.getThemeStyle(theme);
    // } else {
    this.assignStyle(document.body.style, theme);
//    }
    // GLOBALS.theme = theme;
    GLOBALS.saveWebData();
  }

  assignStyle(style: CSSStyleDeclaration, theme: any): void {
    if (style == null) {
      return;
    }
    for (const key of Object.keys(theme)) {
      let value = theme[key];
      if (this.ms.colors[value] != null) {
        value = this.ms.colors[value];
      }
      this.currTheme[key] = value;
      style.setProperty(`--${key}`, value);
    }
  }

  getThemeStyle(theme: any): any {
    const ret: any = {};
    for (const key of Object.keys(theme)) {
      let value = theme[key];
      if (this.ms.colors[value] != null) {
        value = this.ms.colors[value];
      }
      ret[`--${key}`] = value;
    }
    return ret;
  }

  // sets one value in the theme, but only if this value exists
  setThemeValue(key: string, value: string): void {
    if (document.body.style.getPropertyValue(key) != null) {
      document.body.style.setProperty(key, value);
    }
  }

  // extracts the theme from the body tag
  extractTheme(): any {
    const ret: { [key: string]: string } = {};
    const list = document.body.style.cssText.split(';');
    for (const entry of list) {
      if (!Utils.isEmpty(entry)) {
        const parts = entry.split(':');
        ret[parts[0].trim()] = parts[1].trim();
      }
    }
    return ret;
  }

}
