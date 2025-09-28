import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-lotto-ticket',
  imports: [
    MatButton
  ],
  templateUrl: './lotto-ticket.component.html',
  styleUrl: './lotto-ticket.component.scss'
})
export class LottoTicketComponent {
  @Output()
  numbersChange = new EventEmitter<number[]>();
  protected readonly Array = Array;

  constructor() {
  }

  _numbers: number[];

  get numbers(): number[] {
    this._numbers ??= [];
    return this._numbers;
  }

  @Input()
  set numbers(value: number[]) {
    this._numbers = value ?? [];
  }

  classForItem(number: number): string[] {
    const ret: string[] = [];
    if (this.numbers.includes(number)) {
      ret.push('current');
    }
    return ret;
  }

  onItemClick(number: number) {
    if (this.numbers.includes(number)) {
      this.numbers = this.numbers.filter(n => n !== number);
      this.numbersChange.emit(this.numbers);
    } else if (this.numbers.length < 6) {
      this.numbers.push(number);
      this.numbersChange.emit(this.numbers);
    }
  }
}
