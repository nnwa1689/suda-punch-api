## Suda Punch API
速打打卡系統 API 專案：使用 NestJS 框架構建的後端服務，提供打卡功能的 API 介面。

<p align="center"><img width="256" height="256" alt="SudaLogo" src="https://github.com/user-attachments/assets/d15fa70f-2958-473d-8765-2a27ebf0aaa3" />
</p>

## 說明

* 建立一個易用且可靠的速打打卡系統 API，方便用戶快速記錄和管理打卡資訊。

* 功能單一且專注於打卡操作，確保系統的穩定性和高效性。

## 環境參數建立
專案會依照不同環境載入對應的環境變數檔案，請在專案根目錄下建立以下環境變數檔案，並根據需求填寫對應的參數值：
- `.env.development`：開發環境的環境變數。
- `.env.production`：生產環境的環境變數。

## 安裝相依套件

```bash
$ npm install
```

## 本地開發或執行

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 產品環境

產品環境需建立 `.env.production` 環境變數檔案，並設定相關參數。請參考 `.env.development` 範例檔案內容。

啟動時建議帶入參數啟動：

```bash
$ NODE_ENV=production npm run start:prod
```

## 資料庫建立

請確保已安裝並啟動 PostgreSQL 資料庫，並根據 `.env` 檔案中的設定建立對應的資料庫。

安裝完成後，請使用 `suda_database` 路徑下的檔案，透過 pgAdmin 的 Restore 還原資料表結構與初始資料。

## 未來規劃

本 API 未來將提供 Suda 速打打卡系統串接，預計作為 iOS 以及 Android APP 開發的練習專案，如本系統有可用之處，可自行取用修改。
