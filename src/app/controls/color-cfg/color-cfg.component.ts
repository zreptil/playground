import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {MessageService} from '@/_services/message.service';
import {ColorCfgDialogComponent} from '@/controls/color-cfg/color-cfg-dialog/color-cfg-dialog.component';

@Component({
  selector: 'color-cfg',
  templateUrl: './color-cfg.component.html',
  styleUrls: ['./color-cfg.component.scss']
})
export class ColorCfgComponent {

  @ViewChild('input') input: ElementRef;

  @Input() colorKey: string;

  constructor(private ms: MessageService) {
  }

  // btnOpen(evt: MouseEvent) {
  //   evt.stopPropagation();
  //   this.value = this.ts.currTheme[this.color];
  //   this.lastValue = this.value;
  //   setTimeout(() => this.input.nativeElement.click());
  // }
  //
  // colorInput(_evt: any) {
  //   this.ts.currTheme[this.color] = this.value;
  //   this.ts.assignStyle(document.body.style, this.ts.currTheme);
  // }
  showDialog() {
    this.ms.showPopup(ColorCfgDialogComponent, 'colorcfgdialog', {colorKey: this.colorKey});
  }
}
