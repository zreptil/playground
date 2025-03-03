import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {DialogComponent} from '@/components/dialog/dialog.component';
import {ColorPickerComponent} from '@/controls/color-picker/color-picker.component';
import {ColorPickerImageComponent} from '@/controls/color-picker/color-picker-image/color-picker-image.component';
import {ColorPickerMixerComponent} from '@/controls/color-picker/color-picker-mixer/color-picker-mixer.component';
import {ColorPickerBaseComponent} from '@/controls/color-picker/color-picker-base.component';
import {WelcomeComponent} from '@/components/welcome/welcome.component';
import {MainComponent} from '@/components/main/main.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {MaterialModule} from '@/material.module';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {LogComponent} from '@/components/log/log.component';
import {WhatsNewComponent} from '@/components/whats-new/whats-new.component';
import {ImpressumComponent} from '@/components/impressum/impressum.component';
import {ProgressComponent} from '@/components/progress/progress.component';
import {AutofocusDirective} from '@/_directives/autofocus.directive';
import {SiteThumblingComponent} from './components/site-thumbling/site-thumbling.component';
import {SitePrimeNumbersComponent} from './components/site-prime-numbers/site-prime-numbers.component';
import {SiteRubikComponent} from './components/site-rubik/site-rubik.component';
import {RubikMoveComponent} from './controls/rubik-move/rubik-move.component';
import {BrowserAnimationsModule, provideAnimations} from '@angular/platform-browser/animations';
import {HideMissingImageDirective} from './_directives/hide-missing-image.directive';
import {NgOptimizedImage} from '@angular/common';
import {SitePdfComponent} from './components/site-pdf/site-pdf.component';
import {ColorPickerDialog} from '@/controls/color-picker/color-picker-dialog/color-picker-dialog';
import {CloseButtonComponent} from '@/controls/close-button/close-button.component';
import {ColorCfgComponent} from '@/controls/color-cfg/color-cfg.component';
import {ColorCfgDialogComponent} from '@/controls/color-cfg/color-cfg-dialog/color-cfg-dialog.component';
import {ColorPickerHslComponent} from '@/controls/color-picker/color-picker-hsl/color-picker-hsl.component';
import {ColorPickerSliderComponent} from '@/controls/color-picker/color-picker-slider/color-picker-slider.component';
import {SiteCollatzComponent} from '@/components/site-collatz/site-collatz.component';
import {SitePuzzlendarComponent} from '@/components/site-puzzlendar/site-puzzlendar.component';

@NgModule({
  declarations: [
    AutofocusDirective,
    AppComponent,
    DialogComponent,
    ColorPickerComponent,
    ColorPickerDialog,
    ColorPickerImageComponent,
    ColorPickerMixerComponent,
    ColorPickerBaseComponent,
    CloseButtonComponent,
    ColorCfgComponent,
    ColorCfgDialogComponent,
    ColorPickerHslComponent,
    ColorPickerSliderComponent,
    WhatsNewComponent,
    MainComponent,
    WelcomeComponent,
    ImpressumComponent,
    SiteThumblingComponent,
    SitePrimeNumbersComponent,
    SiteRubikComponent,
    RubikMoveComponent,
    HideMissingImageDirective,
    SitePdfComponent,
    SiteCollatzComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule,
    HttpClientModule,
    DragDropModule,
    LogComponent,
    ProgressComponent,
    NgOptimizedImage,
    ReactiveFormsModule,
    SitePuzzlendarComponent
  ],
  providers: [provideAnimations()],
  bootstrap: [AppComponent]
})
export class AppModule {
}
