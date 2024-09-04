import { ButtonList } from 'src/app/core/models/button-list.model';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { AuthMenuService } from 'src/app/core/services/auth-menu.service';
import { DialogService } from 'primeng/dynamicdialog';
import { FormBuilder } from '@angular/forms';
import { LoadingMaskService } from 'src/app/shared/services/loading-mask.service';
import { OptionService } from 'src/app/shared/services/option.service';
import { StorageService } from '../../services/storage.service';
import { SystemConfirmationService } from 'src/app/shared/services/system-confirmation.service';
import { SystemMessageService } from 'src/app/shared/services/system-message.service';
import { TranferColumnService } from 'src/app/shared/services/tranfer-column.service';
import { SystemLocalStorage } from 'src/app/core/enum/system-local-storage.enum';

@Component({
  template: '',
})
export abstract class BaseComponent implements OnInit {
  private userIP = '127.0.0.1';

  abstract ngOnInit(): void;
  private authService = inject(AuthService);
  private authMenuService = inject(AuthMenuService);
  protected dialogService = inject(DialogService);
  protected formBuilder = inject(FormBuilder);
  protected loadingMaskService = inject(LoadingMaskService);
  protected optionService = inject(OptionService);
  protected storageService = inject(StorageService);
  protected systemConfirmationService = inject(SystemConfirmationService);
  protected systemMessageService = inject(SystemMessageService);
  protected tranferColumnService = inject(TranferColumnService);

  get getUserIP(): string {
    return this.userIP;
  }

  get userName(): string {
    return this.authService.getUser().UserName;
  }

  get userAccount(): string {
    return this.authService.getUser().UserId;
  }

  get authButtonList(): ButtonList {
    return this.authMenuService.getButtonList(
      this.storageService.getSessionStorageItem(
        SystemLocalStorage.REDIRECT_MENUID,
      ),
    );
  }

  get menuId(): string {
    return this.storageService.getSessionStorageItem(
      SystemLocalStorage.REDIRECT_MENUID,
    );
  }

  /** any 因傳進的參數都不一定 */
  setDefaultParams(params: any): void {
    const lastdefaultParams = this.storageService.getSessionStorageItem(
      'searchDefaultParams',
    );
    const currentBhno = lastdefaultParams
      ? JSON.parse(lastdefaultParams).bhno
      : '';
    const currentCseq = lastdefaultParams
      ? JSON.parse(lastdefaultParams).cseq
      : '';
    const defaultParams = {
      bhno: params.bhno ? params.bhno : currentBhno,
      cseq: params.cseq ? params.cseq : currentCseq,
    };
    this.storageService.setSessionStorageItem(
      'searchDefaultParams',
      JSON.stringify(defaultParams),
    );
  }

  /** 因清除會使用到故增加變數 */
  getDefaultParams(): { bhno: string; cseq: string } {
    const searchDefaultParams = this.storageService.getSessionStorageItem(
      'searchDefaultParams',
    );
    return {
      bhno: searchDefaultParams ? JSON.parse(searchDefaultParams).bhno : '',
      cseq: searchDefaultParams ? JSON.parse(searchDefaultParams).cseq : '',
    };
  }

  getUserInfoDefaultParams(): {
    APISERVER: string;
    DBSource: string;
  } {
    const userInfoDefaultParams =
      this.storageService.getSessionStorageItem('userProfile');
    return {
      APISERVER: JSON.parse(userInfoDefaultParams).EsmpIp,
      DBSource: JSON.parse(userInfoDefaultParams).DefaultDBSource,
    };
  }
}
