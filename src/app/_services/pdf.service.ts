import {Injectable} from '@angular/core';
import {HttpClient, HttpRequest} from '@angular/common/http';
import {PageData} from '@/_model/page-data';
import {Log} from '@/_services/log.service';
import {GLOBALS} from '@/_services/globals.service';
import {ProgressService} from '@/_services/progress.service';
import {Utils} from '@/classes/utils';
import {forkJoin, map, Observable, of} from 'rxjs';
import {TCreatedPdf} from 'pdfmake/build/pdfmake';
import {PrintCustomForm} from '@/forms/print-custom-form';
import {FormConfig} from '@/forms/form-config';
import {ReportData} from '@/_model/report-data';

export class PdfData {
  isPrinted = false;

  constructor(public pdf: any) {
  }
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  formList = [new PrintCustomForm(this)];
  pdfMake: any;
  pdfList: PdfData[] = [];
  pdfDoc: any = null;
  images: any;

  constructor(public http: HttpClient,
              public ps: ProgressService) {
    for (const form of this.formList) {
      GLOBALS.listConfigOrg.push(new FormConfig(form, false));
    }
    Utils.pushAll(GLOBALS.listConfig, GLOBALS.listConfigOrg);
    GLOBALS.loadFormListParams();
  }

  get msgCreatingPDF(): string {
    return $localize`:text when pdf is being created:Erzeuge PDF...`;
  }

  get msgPreparingPDF(): string {
    return $localize`Lade die Basisdaten...`;
  }

  get msgLoadingDataError(): string {
    return $localize`Fehler beim Laden der Daten`;
  }

  get msgShowPDF(): string {
    return $localize`PDF anzeigen`;
  }

  msgLoadingData(error: string, stacktrace: string): string {
    return $localize`Fehler beim Laden der Daten:\n${error}\n${stacktrace}`;
  }

  async loadPdfMaker() {
    if (this.pdfMake == null) {
      const pdfMakeModule: any = await import('pdfmake/build/pdfmake');
      const pdfFontsModule: any = await import('pdfmake/build/vfs_fonts');
      this.pdfMake = pdfMakeModule.default;
      this.pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;
    }
  }

  async generatePdf(doSave = true) {
    if (doSave) {
      GLOBALS.saveSharedData();
    }
    this.pdfList = [];
    this.ps.max = 1;
    this.ps.value = 0;
    this.ps.text = this.msgPreparingPDF;
    const repData: ReportData = new ReportData();
    repData.data = GLOBALS.siteConfig.pdfData ?? {};
//    Log.showTimer('loadData done');
    if (!repData?.isValid) {
      console.error('repData ist nicht gültig', repData);
      this.ps.text = null;
      return;
    }
    GLOBALS.siteConfig.isCreatingPDF = true;
    try {
      this.ps.max = 1;
      this.ps.value = 0;
      this.ps.text = this.msgCreatingPDF;
      if (repData.error != null) {
        if (GLOBALS.isDebug) {
          Log.error(this.msgLoadingData(repData.error.toString(), repData.error.stack.toString()));
        } else {
          Log.error(this.msgLoadingDataError);
        }
        GLOBALS.siteConfig.isCreatingPDF = false;
        this.ps.text = null;
        return;
      }
      // let docLen = 0;
      // let prevPage: PageData = null;
      let listConfig = GLOBALS.listConfig.filter(cfg => cfg.checked);
      const cfgList: Observable<any>[] = [];
      let idx = 0;
      for (const cfg of listConfig) {
        cfgList.push(this.collectPages(cfg, idx++, repData));
      }
      forkJoin(cfgList).subscribe({
        next: (dataList: { idx: number, docList: any[] }[]) => {
          // pdfMake.Styles styles = pdfMake.Styles();
          // pdfMake.PDFContent pdf = pdfMake.PDFContent(content: [doc], styles: styles);
          // pdfMake.create(pdf).open();
          // .getDataUrl(function(outDoc)
          // {
          // $("#output").text(outDoc);
          // });
          dataList = dataList.filter(entry => entry != null);
          dataList.sort((a, b) => Utils.compare(a.idx, b.idx));
          const docList: any[] = []
          for (const data of dataList) {
            Utils.pushAll(docList, data.docList);
          }
          if (docList.length > 1) {
            const pdfData: any = docList[0];
            for (let i = 1; i < docList.length; i++) {
              /*
                            const content = [{
                              text: '',
                              pageBreak: 'after',
                              pageSize: 'a4',
                              pageOrientation: listConfig[i]?.form.isPortrait ? 'portrait' : 'landscape',
                              images: docList[i].images
                            }, docList[i].content];
              */
              docList[i].content.splice(0, 0, {
                text: '',
                pageBreak: 'after',
                pageSize: docList[i].pageSize,
                pageOrientation: docList[i].pageOrientation,
              });
              for (const key of Object.keys(docList[i].images)) {
                pdfData.images[key] = docList[i].images[key];
              }
              pdfData.content.push(docList[i].content);
            }
            this.makePdf(pdfData);
            return;
            // this.pdfList = [];
            // let pdfDoc: any = null;
            //
            // // for (const doc of docList) {
            // //   const dst = jsonEncode(doc);
            // //   if (GLOBALS.isDebug) {
            // //     // pdfUrl = 'http://pdf.zreptil.de/playground.php';
            // //     dst = dst.replaceAll('],', '],\n');
            // //     dst = dst.replaceAll(',\"', ',\n\"');
            // //     dst = dst.replaceAll(':[', ':\n[');
            // //   } else {
            // //     // pdfUrl = 'https://nightscout-reporter.zreptil.de/pdfmake/pdfmake.php';
            // //   }
            // //   pdfList.add(PdfData(pdfString(dst)));
            // // }
            // for (const doc of docList) {
            //   this.pdfList.push(new PdfData(doc));
            // }
            // this.ps.progressText = null;
            // this._generatePdf(docList);
            // return;
          } else {
            this.pdfDoc = docList[0];
          }
          this.makePdf(this.pdfDoc);
        }, error: (error) => {
          GLOBALS.siteConfig.isCreatingPDF = false;
          Log.devError(error, 'Fehler im PdfService');
        }, complete: () => {
          GLOBALS.siteConfig.isCreatingPDF = false;
        }
      });
      // if (!g.isDebug) {
      //   if (g.msg.text.isEmpty) {
      //     if (isForThumbs) {
      //       navigate('makePdfImages');
      //     } else {
      //       navigate('showPdf');
      //     }
      //   } else {
      //     displayLink(msgShowPDF, 'showPdf', btnClass: 'action', icon: 'description');
      //   }
      // } else {
      //   displayLink('playground', 'showPlayground', btnClass: 'action', icon: 'description');
      //   displayLink('pdf', 'showPdf', btnClass: 'action', icon: 'description');
      // }
      // sendIcon = 'send';
      // progressText = null;
    } catch (ex) {
      GLOBALS.siteConfig.isCreatingPDF = false;
      Log.devError(ex, 'Fehler im PdfService');
    } finally {
      this.ps.text = null;
    }
    /*
        }).catchError((error) {
          g.info.addDevError(error, msgPDFCreationError);
          sendIcon = 'send';
          progressText = null;
          return -1;
        });
    */
  }

  collectBase64Images(list: string[]): Observable<any> {
    this.images = {};
    const listObservables: Observable<any>[] = [];
    for (const id of list) {
      listObservables.push(this.collectBase64Image(id));
    }
    if (listObservables.length == 0) {
      listObservables.push(of({}));
    }
    return forkJoin(listObservables);
  }

  showPdf(data: any) {
    this._generatePdf(data);
  }

  private collectPages(cfg: FormConfig, idx: number, repData: ReportData): Observable<{ idx: number, docList: any[] }> {
    let doc: any;
    const docList: any[] = [];

    const form = cfg.form;
    let prevPage: PageData;
    const docLen = JSON.stringify(doc ?? {}).length;
    return form.getFormPages(repData, docLen).pipe(map((formPages: PageData[]) => {
      const fileList: PageData[][] = [[]];
      for (const page of formPages) {
        const entry = page.content[page.content.length - 1];
        if (entry.pageBreak === 'newFile' && !Utils.isEmpty(fileList[fileList.length - 1])) {
          delete (entry.pageBreak);
          fileList[fileList.length - 1].push(page);
          fileList.push([]);
        } else {
          if (entry.pageBreak === 'newFile') {
            delete (entry.pageBreak);
          } //entry["pageBreak"] = "after";
          fileList[fileList.length - 1].push(page);
        }
      }

      for (const pageList of fileList) {
        const content: any[] = [];
        const background: any[] = [];
        for (const page of pageList) {
          if (prevPage != null) {
            const pagebreak: any = {text: '', pageBreak: 'after'};
            if (page.isPortrait != prevPage.isPortrait) {
              pagebreak.pageSize = 'a4';
              pagebreak.pageOrientation = page.isPortrait ? 'portrait' : 'landscape';
            }
            content.push(pagebreak);
            background.push(pagebreak);
          }
          content.push(page.asElement);
          background.push(page.asBackElement);
          prevPage = page;
        }
        if (doc == null) {
          doc = {
            pageSize: 'a4',
            pageOrientation: Utils.isEmpty(pageList) || pageList[0].isPortrait ? 'portrait' : 'landscape',
            pageMargins: [form.cm(0), form.cm(1.0), form.cm(0), form.cm(0.0)],
            background: background,
            content: content,
            images: form.images,
            styles: {
              infoline: {
                margin: [form.cm(0), form.cm(0.25), form.cm(0), form.cm(0.25)]
              },
              perstitle: {alignment: 'right'},
              persdata: {color: '#0000ff'},
              infotitle: {alignment: 'left'},
              infodata: {alignment: 'right', color: '#0000ff'},
              infounit: {
                margin: [form.cm(0), form.cm(0), form.cm(0), form.cm(0)],
                color: '#0000ff'
              },
              hba1c: {color: '#5050ff'},
              total: {bold: true, fillColor: '#d0d0d0', margin: form.m0},
              timeDay: {bold: true, fillColor: '#d0d0d0', margin: form.m0},
              timeNight: {bold: true, fillColor: '#303030', color: 'white', margin: form.m0},
              timeLate: {bold: true, fillColor: '#a0a0a0', margin: form.m0},
              row: {}
            }
          };
        } else {
          doc.content.push(content);
          for (const key of Object.keys(form.images)) {
            doc.images[key] = form.images[key];
          }
        }

        if (pageList != fileList[fileList.length - 1]) {
          docList.push(doc);
          doc = null;
          prevPage = null;
        }
      }
      if (doc != null) {
        docList.push(doc);
      }

      return {idx: idx, docList: docList};
    }));
    // return of(null);
    // if (g.isLocal && data != fileList.last)doc = null;
    //   prevForm = form;
  }

  /**
   * Preprocesses the pdf-data before creating it with pdfmake.
   * Every text-node is checked for special format-information
   * and processed accordingly.
   * @param data data to process
   */
  private preprocessData(data: any) {
    if (typeof data === 'object' && data != null) {
      for (const key of Object.keys(data)) {
        if (key === 'text') {
          const text = data[key];
          let isHebrew = false;
          for (let i = 0; i < text?.length; i++) {
            const code = text.charCodeAt(i);
            if (code >= 1425 && code <= 1524) {
              isHebrew = true;
            }
          }
          if (isHebrew) {
            data.font = 'Hebrew';
            const text = Utils.join(data.text.split(' ').reverse(), '  ');
            data.text = undefined;
            data.stack = text.split(',').reverse();
          }
        } else {
          this.preprocessData(data[key]);
        }
      }
    } else if (Array.isArray(data)) {
      for (const subdata of data) {
        this.preprocessData(subdata);
      }
      return;
    }
  }

  private makePdf(data: any) {
    this.preprocessData(data.content);
    if (GLOBALS.isDebug) {
      Log.displayLink(this.msgShowPDF, `showPdf`, {btnClass: 'action', icon: 'description', data: data});
      Log.displayLink('Playground', `showPlayground`, {btnClass: 'action', icon: 'description', data: data});
      this.ps.clear();
//      Log.stopTimer('pdf generated');
      return;
    }
    this._generatePdf(data).then(_ => {
      this.ps.clear();
//      Log.stopTimer('pdf generated');
    });
  }

  private async _generatePdf(data: any) {
    if (data == null) {
      Log.error('Es sind keine Seiten vorhanden');
      return;
    }
    await this.loadPdfMaker();
    // pdfmake changes the
    this.http.get('assets/fonts/pdfmake-fonts.json').subscribe(vfs => {
      let fonts: any = {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        }
      };

      if (GLOBALS.language.code === 'ja-JP') {
        fonts['Roboto'] = {
          normal: 'ipagp.ttf',
          bold: 'ipagp.ttf',
          italics: 'ipagp.ttf',
          bolditalics: 'ipagp.ttf'
        };
      } else {
        fonts['Hebrew'] = {
          normal: 'Open Sans Hebrew.ttf',
          bold: 'Open Sans Hebrew Bold.ttf',
          italics: 'Open Sans Hebrew Italic.ttf',
          bolditalics: 'Open Sans Hebrew Bold Italic.ttf'
        };
        // vfs = null;
      }
      const pdf: TCreatedPdf = this.pdfMake.createPdf(JSON.parse(JSON.stringify(data)), null, fonts, vfs);
      const target = document.getElementById('pdf');
      if (GLOBALS.siteConfig.ppPdfSameWindow) {
        pdf.getDataUrl((base64URL) => {
          document.write(`<iframe src="${base64URL}" style="border:0;top:0;left:0;bottom:0;right:0;width:100%;height:100%;" allowFullScreen></iframe>`);
        });
      } else if (GLOBALS.siteConfig.ppPdfDownload) {
        pdf.download();
      } else if (target != null) {
        pdf.getDataUrl((base64URL) => {
          target.setAttribute('src', base64URL);
        });
      } else {
        try {
          pdf.open();
        } catch (ex) {
          Log.error($localize`Das PDF konnte nicht angezeigt werden. Ist ein Popup-Blocker aktiv?`);
          pdf.download();
        }
      }
    });
  }

  private collectBase64Image(id: string): Observable<{ id: string, url: string }> {
    const req = new HttpRequest('GET', `assets/images/${id}.png`,
      null,
      {responseType: 'arraybuffer'});
    return this.http.request(req)
      .pipe(map(data => {
        return {id: id, url: `data:image/png;base64,${btoa(String.fromCharCode(...new Uint8Array((data as any).body)))}`};
      }));
  }
}
