import { Injectable } from '@angular/core';

/**
 * 讀寫 localStorage 和 sessionStorage 的服務。
 *
 * @export
 * @class StorageService
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  /**
   * IE11、Edge 開不同視窗儲存的 localStorage 不會互相同步。
   * 解決方法是在取值之前先 setItem，隨便設定一個值，再去 getItem 就可以抓到。
   * 透過這個方法去 localStorage getItem 的時候統一處理。
   *
   * @param key localStorage key
   * @returns localStorage value
   */
  getLocalStorageItem(key: string): string {
    localStorage.setItem('timestamp', new Date().getTime().toString());
    let value = localStorage.getItem(key);
    return value ? value : '';
  }

  /**
   * 設定 localStorage
   * @param key localStorage key
   * @param value localStorage value
   */
  setLocalStorageItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  /**
   * 移除 localStorage
   * @param key localStorage key
   */
  removeLocalStorageItem(key: string) {
    localStorage.removeItem(key);
  }

  /**
   * 移除所有 localStorage
   */
  removeAllLocalStorageItem() {
    localStorage.clear();
  }

  /**
   * IE11、Edge 開不同視窗儲存的 sessionStorage 不會互相同步。
   * 解決方法是在取值之前先 setItem，隨便設定一個值，再去 getItem 就可以抓到。
   * 透過這個方法去 sessionStorage getItem 的時候統一處理。
   *
   * @param key sessionStorage key
   * @returns sessionStorage value
   */
  getSessionStorageItem(key: string): string {
    sessionStorage.setItem('timestamp', new Date().getTime().toString());
    let value = sessionStorage.getItem(key);
    return value ? value : '';
  }

  /**
   * 設定 sessionStorage
   * @param key sessionStorage key
   * @param value sessionStorage value
   */
  setSessionStorageItem(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  }

  /**
   * 移除 sessionStorage
   * @param key sessionStorage key
   */
  removeSessionStorageItem(key: string) {
    sessionStorage.removeItem(key);
  }

  /**
   * 移除所有 sessionStorage
   */
  removeAllSessionStorageItem() {
    sessionStorage.clear();
  }
}
