import {
  DialogService,
  DynamicDialogRef,
  DynamicDialogConfig,
} from 'primeng/dynamicdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HttpErrorInterceptor } from './core/interceptor/http-error.interceptor';
import { JwtInterceptor } from './core/interceptor/jwt.interceptor';
import { LayoutModule } from './layout/layout.module';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IbpaasBaseComponentModule } from './base/ibpaas-base-component.module';

//引入  DynamicDialog 跟 StockSearchDialog
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DatePipe } from '@angular/common';

// 多國語系設定參考 https://edwardzou.blogspot.com/2019/01/ngx-translate.html
// AoT requires an exported function for factories
// 建立 TranslateHttpLoader 作為語系檔的讀取器
// 有兩個參數可以使用，分別是多語系的檔案路徑及副檔名，如果都沒有設定的話預設會使用「/assets/i18n/」及「.json」，
// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http);
// }

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule,
    IbpaasBaseComponentModule,
    SharedModule,
    HttpClientModule,
    LayoutModule,
    DynamicDialogModule,
  ],
  providers: [
    MessageService, // 配合全域的 toast message service (SystemMessageService) 只能在這邊設 providers,
    ConfirmationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    DialogService,
    DynamicDialogRef,
    DynamicDialogConfig,
    DatePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
