import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environment';
import { Observable, concatMap, filter, map, of } from 'rxjs';
import { StorageService } from '../../base/services/storage.service';
import { SystemLocalStorage } from '../enum/system-local-storage.enum';
import { Auth } from '../models/auth.model';
import { UserProfile } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly userBaseApiUrl = `${environment.apiEndpoint}${environment.userEndpoint}`;
  tokenError: boolean = false;

  constructor(
    private storageService: StorageService,
    private httpClient: HttpClient,
    private router: Router,
  ) {}

  /**
   * 取得 user 基本資訊，然後存到 localStorage userProfile，目前裡面只放 username = 工號
   *
   * @returns 是否有取得 user 基本資訊
   */
  profile(): Observable<boolean> {
    const token = this.getJwtToken();
    let endpoint: string = `${this.userBaseApiUrl}/infos`;
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/auth/current/info.json`;
    }
    return this.httpClient
      .get<UserProfile>(endpoint, {
        params: { token },
      })
      .pipe(
        map((userProfile) => {
          if ((userProfile && userProfile.UserId) || environment.apiMock) {
            sessionStorage.setItem(
              SystemLocalStorage.USER_PROFILE,
              JSON.stringify(userProfile),
            );
            return true;
          } else {
            return false;
          }
        }),
      );
  }

  login(username: string, password: string): Observable<boolean> {
    console.log('login');
    let endpoint = `${this.userBaseApiUrl}/login`;
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/auth/login.json`;
    }

    return (
      this.httpClient
        .get<Auth>(endpoint, {
          params: { u: username, p: password },
        })
        // 接到 ErrCode 200 跟 token，將 token 存入
        .pipe(
          map((rep) => {
            if (
              (rep.ErrCode === 200 && rep.Token) ||
              (environment.apiMock && rep.Token)
            ) {
              this.setJwtToken(rep.Token);
              // console.log('Login token', rep.Token);
              return true;
            }
            return false;
          }),
        )
    );
  }

  /**
   * 完整的手動登入流程，先取得 JWT 後再去取得 user profile
   *
   * @param username 帳號
   * @param password 密碼
   * @returns 是否有取到合法的 JWT Token 和 user 基本資訊
   */
  manualLogin(username: string, password: string): Observable<boolean> {
    return this.login(username, password).pipe(
      // tap((authResult) => console.log('RxJS jwt result = ' + authResult)),
      filter((authResult) => authResult),
      concatMap((authResult) =>
        this.profile().pipe(
          // tap((profileResult) =>
          //   console.log('RxJS userProfile result = ' + profileResult),
          // ),
          map((profileResult) => {
            if (authResult && profileResult) {
              return true;
            } else {
              return false;
            }
          }),
        ),
      ),
    );
  }

  /**
   * 從 SessionStorage 取得 jwtToken
   * @returns jwtToken
   */
  getJwtToken(): string {
    // return 'jwtToken';
    return this.storageService.getSessionStorageItem(
      SystemLocalStorage.JWT_TOKEN,
    );
  }

  /**
   * 將 jwtToken 存進 SessionStorage
   * @returns jwtToken
   */
  setJwtToken(token: string): void {
    this.storageService.setSessionStorageItem(
      SystemLocalStorage.JWT_TOKEN,
      token,
    );
  }

  /**
   * 從 SessionStorage 取得登入使用者的基本資訊
   * @returns 登入使用者的基本資訊
   */
  getUser(): UserProfile {
    const userProfile: string = this.storageService.getSessionStorageItem(
      SystemLocalStorage.USER_PROFILE,
    );
    return userProfile ? JSON.parse(userProfile) : '';
  }

  /**
   * 透過 refreshToken 重新取得 accessToken
   * @returns 是否有取到合法的 JWT Token
   */
  refresh(): Observable<boolean> {
    let endpoint = `${this.userBaseApiUrl}/refresh`;
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/refresh.json`;
      let observable: Observable<Auth> = this.httpClient.get<Auth>(endpoint);
      return observable.pipe(
        map((auth) => {
          if (auth.Token) this.setJwtToken(auth.Token);
          return true;
        }),
      );
    }
    let observable: Observable<Auth> = this.httpClient.post<Auth>(endpoint, {
      RefreshToken: this.getJwtToken(),
    });

    return observable.pipe(
      map((auth) => {
        // 修改成錯誤攔截器處理(防呆)
        if (auth.ErrCode !== 200) {
          this.storageService.setLocalStorageItem('ErrMsg', 'refresh token error');
        //   console.log(
        //     this.storageService.setLocalStorageItem('ErrMsg', auth.ErrMsg),
        //   );
          return false;
        }
        if (auth.Token) this.setJwtToken(auth.Token);
        return true;
      }),
    );
  }

  logout(isTimeOut = false): void {
    this.storageService.removeAllSessionStorageItem();
    if (isTimeOut) {
      this.router.navigate(['/login'], { queryParams: { isTimeOut } });
      return;
    }
    this.router.navigate(['/login']);
  }
}
