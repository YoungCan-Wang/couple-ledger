# 小两口记账 · 情侣共享 App（React Native / Expo）

一款给情侣共用的记账 App：双账户（小兔 / 小虎 / 共同）、收支分类、本月结余与双人对比、
待办清单（未完成自动顺延到第二天）、每日推送预览（早安简报 / 明日天气 / 待办总结），
以及兔粉 · 虎橙的小清新配色。本仓库是**完整可编译的源码**，照下面步骤即可生成安卓 APK。

> 设计原型见同工作区的 Ardot 设计文件「小两口记账 · 情侣共享App」。

---

## 一、怎么生成 APK（在云端打包，不用装安卓工具）

本方案用 **Expo + EAS Build**：编译在 Expo 的云服务器上完成，你**不需要**在本机装
Android SDK / Java，对非技术用户最友好。

### 准备（只需一次）
1. 电脑装 Node.js（https://nodejs.org ，选 LTS 版）。
2. 注册一个 Expo 账号（https://expo.dev ，免费）。
3. 打开命令行，安装 EAS 工具：
   ```bash
   npm install -g eas-cli
   eas login
   ```

### 打包 APK
4. 把本文件夹（`couple-ledger`）复制到电脑上，进入文件夹：
   ```bash
   cd couple-ledger
   npm install
   eas build -p android --profile preview
   ```
5. 首次会问你几个问题，一路回车用默认即可；随后会给你一个**构建链接**，
   打开它看进度，几分钟后状态变成「Build complete」，点下载得到 `app-release.apk`。

> 想要上架华为应用市场，可改用 `eas build -p android --profile production` 生成 `.aab`。

---

## 二、装到华为 Mate60RS 上

1. 把 `app-release.apk` 用数据线 / 微信 / 邮件传到手机。
2. 手机打开「设置 → 安全 → 更多安全设置 → 安装未知来源应用」，给「文件管理 / 浏览器」打开权限。
3. 点开 APK 文件，按提示「安装」即可。装好后桌面就有图标了。
4. 三星手机步骤一样（设置里允许「未知来源」），**一个 APK 两机型通用**（都是安卓）。

---

## 三、两人实时同步（已接入 Firebase，免费）

数据现在可以走 **Firebase Firestore** 实时同步：你俩在「我们」页填**同一个账本 ID**，
两台手机即自动互相同步——我记一笔，他的手机立刻出现。`src/store.ts` 用 `onSnapshot`
订阅云端账本，断网时退回本机本地（AsyncStorage），联网后继续同步。

### 启用同步只需 4 步
1. 打开 https://console.firebase.google.com → 新建项目 → 左侧「Firestore 数据库」→ 创建（规则先用测试模式，稍后替换）。
2. 项目设置 → 「你的应用」→ 选 Web 应用 → 复制 SDK 配置（apiKey / projectId 等）。
3. 把配置填进 `src/firebase.ts` 顶部的 `firebaseConfig`（把 `YOUR_xxx` 占位符替换掉）。
4. `npm install` 安装依赖，重新打包 APK（见第一节）。两台手机都装上后，在「我们」页
   填同一个账本 ID 点「连接」即可。

> Firebase 的 apiKey 是**公开**的（打包进 App 也安全），真正的权限由下面安全规则控制；
> 账本 ID 就是你们俩的"共享钥匙"，谁知道它谁就能读写该账本，请勿外泄。

### 安全规则（建议）
把根目录 `firestore.rules` 部署到 Firebase（控制台「Firestore → 规则」粘贴，或
`firebase deploy --only firestore:rules`），使匿名登录用户只能读写自己的账本文档：
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ledgers/{ledgerId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 四、项目结构

```
couple-ledger/
├── App.tsx              # 入口 + 底部导航 + 待办顺延
├── app.json             # Expo 配置（应用名 / 包名 / 权限）
├── eas.json             # 云端打包配置（preview=APK, production=AAB）
├── package.json
└── src/
    ├── theme.ts         # 配色 + 分类 + 兔虎身份
    ├── types.ts         # 交易 / 待办 / 提醒 类型
    ├── store.ts         # 本地持久化 + Firebase 实时同步 + 示例数据 + 顺延逻辑
    ├── components/      # BottomNav / CategoryIcon / Mascot
    └── screens/         # Home / AddEntry / Ledger / Todos / Us / DailyPush
```

## 五、本地预览（可选）

想先在电脑上看效果，装好依赖后：
```bash
npm install
npx expo start
```
手机装「Expo Go」App 扫二维码即可；或在电脑按 `w` 开网页预览。

---

需要我帮你把 Firebase 配置接好、或调整任何界面文案 / 配色，随时说。
