# 蘇氏 Chat - Web 程式設計期末專案

這是一個基於 Angular 19 開發的現代化即時聊天應用前端介面。專注於簡潔的用戶體驗與高效的狀態管理。

> 「沒有多餘的功能。一句話，兩個人，就是全部。」

## 專案亮點

- **現代化 UI/UX**：採用粉色調為主。
- **響應式設計**：適配桌面端與行動端瀏覽器。
- **完整認證流程**：包含登入、註冊、Token 自動刷新與路由守護。
- **錯誤處理**：針對網路錯誤、認證失效提供即時的使用者回饋。

## 關鍵技術棧

- **框架**: [Angular 19](https://angular.dev/)
- **語言**: TypeScript
- **樣式**: SCSS (Vanilla CSS Grid/Flexbox)
- **圖標**: Font Awesome 7.0
- **狀態管理**: Angular Signals & RxJS
- **構建工具**: Angular CLI

## 快速開始

### 安裝環境
確保您的開發環境已安裝 [Node.js](https://nodejs.org/) (建議 v20 以上)。

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run start
```

### 構建生產版本
```bash
npm run build
```

## 專案架構摘要

- `src/app/pages/auth-page`: 統一的身份驗證中心（登入/註冊切換）。
- `src/app/services/user-service`: 封裝 API 通訊與 Signal 狀態邏輯。
- `src/app/shared`: 存放通用元件如 Footer, NavBar。
