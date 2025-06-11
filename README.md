# 課程選課系統 - 前端應用

## 專案簡介

本專案是課程選課系統的前端應用，使用 Vue.js 3 開發，提供直觀易用的選課界面。學生可以透過此系統查詢課程、進行選課作業、管理個人課表。

## 主要功能

- **使用者認證**：登入、登出、註冊功能
- **課程查詢**：瀏覽所有課程，支援搜尋與篩選
- **選課作業**：選課、退選，即時顯示選課狀態
- **課表管理**：查看已選課程，支援列表與時間表兩種檢視模式
- **響應式設計**：支援桌面與行動裝置

## 技術棧

- **框架**：Vue.js 3 (Composition API)
- **狀態管理**：Pinia
- **路由**：Vue Router 4
- **HTTP 客戶端**：Axios
- **建置工具**：Vite
- **樣式**：原生 CSS (響應式設計)

## 專案結構

```
src/
├── components/              # 可重用組件
│   ├── NavBar.vue          # 導航列
│   ├── CourseCard.vue      # 課程卡片
│   ├── TimeSlotDisplay.vue # 時間時段顯示
│   └── MessageAlert.vue    # 訊息提示
├── views/                   # 頁面視圖
│   ├── LoginView.vue       # 登入頁
│   ├── RegisterView.vue    # 註冊頁
│   ├── CourseListView.vue  # 課程查詢頁
│   ├── EnrollmentView.vue  # 選課作業頁
│   └── MyCoursesView.vue   # 我的課表頁
├── stores/                  # Pinia 狀態管理
│   ├── auth.js             # 認證狀態
│   └── courses.js          # 課程與選課狀態
├── services/                # API 服務
│   ├── api.js              # Axios 配置
│   ├── authService.js      # 認證服務
│   └── courseService.js    # 課程服務
├── router/                  # 路由配置
│   └── index.js            # 路由定義與守衛
├── composables/             # Composition API 工具
│   └── useDebounce.js      # 防抖功能
└── App.vue                  # 根組件
```

## 環境需求

- Node.js 18+
- npm 或 yarn

## 快速開始

### 1. 複製專案

```bash
git clone <your-frontend-repo-url>
cd course-selection-frontend
```

### 2. 安裝依賴

```bash
npm install
# 或使用 yarn
yarn install
```

### 3. 設定環境變數

建立 `.env` 檔案 (可選)：

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 4. 啟動開發伺服器

```bash
npm run dev
# 或使用 yarn
yarn dev
```

應用將在 `http://localhost:5173` 啟動

### 5. 建置生產版本

```bash
npm run build
# 或使用 yarn
yarn build
```

## 主要頁面介紹

### 登入頁 (`/login`)
- 使用者可輸入帳號密碼登入系統
- 提供測試帳號資訊方便測試
- 支援註冊頁面跳轉

### 課程查詢 (`/courses`)
- 瀏覽所有開設課程
- 支援課程名稱搜尋
- 可依課程類型（必修/選修）與學期篩選
- 顯示課程詳細資訊包含時間、地點、人數

### 選課作業 (`/enrollment`)
- 進行選課與退選操作
- 即時顯示選課規則與限制
- 支援篩選已選課程
- 自動檢查時間衝突與人數限制

### 我的課表 (`/my-courses`)
- 檢視已選修課程
- 支援列表檢視與時間表檢視
- 顯示總學分數與課程統計
- 可直接從課表退選課程

## 主要組件說明

### CourseCard.vue
課程資訊卡片組件，用於顯示課程詳細資訊：
- 課程名稱、代碼、類型
- 學分數、人數統計
- 上課時間與地點
- 選課/退選按鈕（可選）

### TimeSlotDisplay.vue
時間時段顯示組件：
- 格式化顯示星期與時間
- 支援多個時段顯示
- 包含上課地點資訊

### MessageAlert.vue
訊息提示組件：
- 支援成功、錯誤、資訊三種類型
- 自動消失功能
- 固定定位在畫面右上角

## 狀態管理

### Auth Store (`stores/auth.js`)
管理使用者認證狀態：
- `user`: 當前使用者資訊
- `isAuthenticated`: 登入狀態
- `login()`: 登入方法
- `logout()`: 登出方法
- `fetchCurrentUser()`: 取得當前使用者

### Courses Store (`stores/courses.js`)
管理課程與選課狀態：
- `courses`: 課程列表
- `myEnrollments`: 選課記錄
- `myCourses`: 已選課程
- `enrolledCourseIds`: 已選課程 ID 列表
- `fetchCourses()`: 載入課程
- `enrollCourse()`: 選課
- `withdrawCourse()`: 退選

## API 整合

### 基礎配置 (`services/api.js`)
- 配置 Axios 實例
- 設定基礎 URL 與認證
- 統一錯誤處理
- 自動重導向處理

### 認證服務 (`services/authService.js`)
- 登入/登出 API
- 使用者註冊
- 取得當前使用者資訊

### 課程服務 (`services/courseService.js`)
- 課程查詢與篩選
- 選課/退選操作
- 課表資料取得

## 路由配置

### 路由守衛
- **requiresAuth**: 需要登入的頁面（課程相關頁面）
- **requiresGuest**: 訪客限定頁面（登入、註冊頁面）
- 自動重導向至適當頁面

### 頁面路由
```
/ → /login (暫時重導向)
/login → 登入頁
/register → 註冊頁  
/courses → 課程查詢頁
/enrollment → 選課作業頁
/my-courses → 我的課表頁
```

## 開發工具與功能

### 防抖搜尋 (`composables/useDebounce.js`)
搜尋框使用防抖功能，避免過度頻繁的 API 請求。

### 響應式設計
支援桌面與行動裝置：
- 彈性網格佈局
- 可摺疊導航選單
- 適應式表格顯示

### 效能優化
- 使用 `v-memo` 減少不必要的重新渲染
- 組件懶載入
- API 請求去重與快取

## 建置與部署

### 開發環境
```bash
npm run dev      # 啟動開發伺服器
npm run build    # 建置生產版本
npm run preview  # 預覽生產版本
```

### 部署至靜態主機
建置完成後，`dist` 目錄包含所有靜態檔案，可部署至：
- Netlify
- Vercel  
- GitHub Pages
- 任何靜態檔案主機

### Nginx 配置範例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend-server:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 測試資訊

### 測試帳號
系統提供以下測試帳號：
- **學生帳號**：student001-020 / password123
- **教師帳號**：teacher001-003 / password123  
- **管理員帳號**：admin / admin123

### 功能測試流程
1. 使用測試帳號登入
2. 瀏覽課程查詢頁面
3. 進行選課作業測試
4. 查看個人課表
5. 測試退選功能

## 故障排除

### 常見問題

1. **API 連線失敗**
   - 確認後端服務運行在 `http://localhost:8000`
   - 檢查 CORS 設定
   - 驗證 API 基礎 URL 配置

2. **路由跳轉問題**
   - 清除瀏覽器快取
   - 檢查路由守衛邏輯
   - 確認使用者認證狀態

3. **選課操作失敗**
   - 檢查後端業務規則
   - 確認使用者登入狀態
   - 查看瀏覽器開發者工具錯誤訊息

### 除錯技巧

1. **開啟瀏覽器開發者工具**
   - 檢查 Console 錯誤訊息
   - 查看 Network 標籤 API 請求
   - 使用 Vue Devtools 檢查組件狀態

2. **檢查 Pinia 狀態**
   - 使用 Vue Devtools 查看 Store 狀態
   - 確認 API 回應資料格式正確