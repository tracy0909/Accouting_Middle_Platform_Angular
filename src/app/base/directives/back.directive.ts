import { Directive, HostListener } from '@angular/core';
import { NavigationService } from '../services/navigation.service';

/**
 * 在 tag 內寫 btnback 就會自動加上 onClick 會返回上一頁
 */
@Directive({
  selector: '[btnback]'
})
export class BackDirective {

  constructor(private navigationService: NavigationService) { }

  @HostListener('click')
  onClick(): void {
    this.navigationService.back();
  }
}
