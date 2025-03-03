import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

class Num {
  constructor(public num: number) {
  }

  get d3_1(): Num {
    const ret = (this.num - 1) / 3;
    if (Number.isInteger(ret)) {
      return new Num(ret);
    }
    return null;
  }

  get m2(): Num {
    return new Num(this.num * 2);
  }
}

@Component({
  selector: 'app-site-collatz',
  templateUrl: './site-collatz.component.html',
  styleUrls: ['./site-collatz.component.scss']
})
export class SiteCollatzComponent {
  form: FormGroup;
  twoExp: number;
  num: Num;
  tableList: number[][] = [];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      num: ['', [Validators.required, Validators.min(1)]]
    });
  }

  calculate(): void {
    if (this.form.valid) {
      this.twoExp = Math.pow(2, this.form.get('num').value);
      this.num = new Num(this.twoExp);
    }
  }
}
