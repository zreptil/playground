import {AfterViewInit, Component, HostListener} from '@angular/core';
import {PdfService} from '@/_services/pdf.service';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {Utils} from '@/classes/utils';
import {FormConfig} from '@/forms/form-config';

@Component({
  selector: 'app-site-pdf',
  templateUrl: './site-pdf.component.html',
  styleUrls: ['./site-pdf.component.scss']
})
export class SitePdfComponent implements AfterViewInit {
  text: any;
  cfg: FormConfig;
  protected readonly Utils = Utils;

  constructor(public pdf: PdfService) {
    GLOBALS.siteConfig.pdfData ??= {};
    GLOBALS.siteConfig.pdfData.width ??= 6;
    GLOBALS.siteConfig.pdfData.height ??= 3;
    console.log(GLOBALS.listConfig);
    this.cfg = GLOBALS.listConfig.find(cfg => cfg.checked);
    if (this.cfg == null) {
      this.cfg = GLOBALS.listConfig[0];
      this.cfg.checked = true;
    }
  }

  get globals(): GlobalsService {
    return GLOBALS;
  }

  @HostListener('document:keydown', [`$event`])
  handleKeyboardEvent(evt: KeyboardEvent): void {
    if (evt.code === 'Enter') {
      this.pdf.generatePdf();
    }
  }

  ngAfterViewInit(): void {
    this.clickCreate();
  }

  clickCreate() {
    this.pdf.generatePdf();
  }
}
