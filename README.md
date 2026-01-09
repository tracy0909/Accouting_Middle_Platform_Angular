# 帳務管理系統-前端

使用Angular 框架所開發的帳務平台前端內容，
練習帳務平台常見的功能模組，
作為後端帳務 API 的操作介面層（Frontend / BFF UI）。

專案著重於：

* 前端架構設計
* 元件化開發
* 表單處理與驗證
* 與後端 RESTful API 串接流程

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

## API 串接說明

本專案為前端專案，需搭配後端帳務 API 方能顯示資料。
請於下列位置設定 API Base URL：

```
src/environments/environment.ts
```



# SINOPAC Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.
