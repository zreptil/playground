import {Component, input, Input, output} from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {LottoFrequency, LottoService} from '@/_services/lotto.service';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-lotto-ticket',
  imports: [
    MatButton,
    MatIconButton,
    MatIcon
  ],
  templateUrl: './lotto-ticket.component.html',
  styleUrl: './lotto-ticket.component.scss'
})
export class LottoTicketComponent {
  readonly numbersChange = output<number[]>();
  readonly deleteTicket = output<number>();
  index = input.required<number>();

  protected readonly Array = Array;
  private frequency = new LottoFrequency();

  constructor(public ls: LottoService) {
  }

  _numbers: number[];

  get numbers(): number[] {
    this._numbers ??= [];
    return this._numbers;
  }

  @Input()
  set numbers(value: number[]) {
    this._numbers = value ?? [];
    this.frequency = this.ls.calculate(this._numbers);
  }

  classForItem(number: number): string[] {
    const ret: string[] = [];
    if (this.numbers.includes(number)) {
      ret.push('current');
    }
    return ret;
  }

  onItemClick(number: number) {
    let ret: number[];
    if (this.numbers.includes(number)) {
      ret = this.numbers.filter(n => n !== number);
    } else if (this.numbers.length < 6) {
      ret = [...this.numbers, number];
    }

    if (ret != null) {
      this.numbers = ret.sort((a, b) => a - b);
      this.numbersChange.emit(this.numbers);
    }
  }

  styleForItem(number: number) {
    const freq = this.frequency.numbers[number];
    const maxFreq = this.frequency.max;
    const minFreq = this.frequency.min;
    const range = maxFreq - minFreq;
    const normalizedFreq = 0.5 + (freq - minFreq) / range / 2;
    return `opacity: ${normalizedFreq}`;
  }

  onDeleteClick() {
    this.deleteTicket.emit(this.index());
  }

  onClearClick() {
    this.numbers = [];
  }
}
