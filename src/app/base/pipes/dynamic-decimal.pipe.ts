import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dynamicDecimal'
})
export class DynamicDecimalPipe implements PipeTransform {

  transform(value: number | null | ''): string {
    if (value == null || value === '') {
      return '';
    }

    const stringValue = String(value);
    const parts = stringValue.split('.');
    const integerPart = parts[0]; // 整數部分
    const decimalPart = parts[1] || ''; // 小數部分，如果有的話

    let formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // 重新組合整數和小數部分，保留小數位數
    const formattedValue = decimalPart ? formattedIntegerPart + '.' + decimalPart : formattedIntegerPart;

    return formattedValue;
  }
}
