# 帳務系統 - 前端

**Accounting System Frontend (Angular)**

## 專案簡介

本專案為一套使用 **Angular 框架** 所開發的帳務系統前端，
用於實作練習帳務平台常見的功能模組，
並作為後端帳務 API 的操作介面層（Frontend / BFF UI）。

專案著重於：

* 前端架構設計
* 元件化開發
* 表單處理與驗證
* 與後端 RESTful API 串接流程

---

## 專案目的

* Angular 前端框架與實務開發流程
* 模擬帳務平台操作介面
* 前端架構設計與 API 整合經驗

---

## 技術棧

| 類型                 | 使用技術                      |
| ------------------ | ------------------------- |
| Frontend Framework | Angular                   |
| Language           | TypeScript                |
| UI Library         | Angular Material / 自訂 CSS |
| Routing            | Angular Router            |
| Data Flow          | RxJS                      |
| API                | RESTful API               |
| Version Control    | GitHub                    |

---

## 功能模組

* 帳務資料列表顯示
* 新增帳務資料
* 編輯帳務資料
* 查詢 / 篩選功能
* 表單驗證與錯誤處理
* 串接後端 API 顯示資料

---

## 安裝與執行

請確認電腦已安裝 Node.js 與 Angular CLI。

### 安裝套件

```
npm install
```

### 啟動專案

```
ng serve
```

### 瀏覽器開啟

```
http://localhost:4200
```

---

## API 串接說明

本專案為前端專案，需搭配後端帳務 API 才能顯示實際資料。
請於以下位置設定 API Base URL：

```
src/environments/environment.ts
```

範例：

```
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api'
};
```



# SINOPAC Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.
