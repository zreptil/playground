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
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
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
import {provideAnimations} from '@angular/platform-browser/animations';
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
import {SiteLottoComponent} from '@/components/site-lotto/site-lotto.component';
import {provideMomentDateAdapter} from '@angular/material-moment-adapter';
import {DatepickerComponent} from '@/controls/datepicker/datepicker.component';
import {DatepickerDialogComponent} from '@/controls/datepicker/datepicker-dialog/datepicker-dialog.component';
import {DatepickerMonthComponent} from '@/controls/datepicker/datepicker-month/datepicker-month.component';
import {LottoTicketComponent} from '@/components/site-lotto/lotto-ticket/lotto-ticket.component';

export const DATE_FORMAT = {
  parse: {
    dateInput: 'DD.MM.YYYY',   // wie das eingegebene Datum geparst wird
  },
  display: {
    dateInput: 'DD.MM.YYYY',     // wie’s im Input-Feld dargestellt wird
    monthYearLabel: 'MMMM YYYY', // wie der Monats-/Jahresheader aussieht, z. B. „März 2025“
    dateA11yLabel: 'LL',         // für Screen Reader – „LL“ ist oft komplett ausgeschriebenes Datum
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

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
    SiteLottoComponent,
    DatepickerComponent,
    DatepickerDialogComponent,
    DatepickerMonthComponent
  ],
  bootstrap: [AppComponent], imports: [BrowserModule,
    FormsModule,
    MaterialModule,
    DragDropModule,
    LogComponent,
    ProgressComponent,
    NgOptimizedImage,
    ReactiveFormsModule,
    SitePuzzlendarComponent, LottoTicketComponent
  ],
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideMomentDateAdapter(DATE_FORMAT),]
})
export class AppModule {
}
