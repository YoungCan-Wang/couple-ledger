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

## 三、关于"两人同步"（重要）

当前版本数据存在**各自手机本地**（AsyncStorage）。也就是说：你俩能在同一套界面里记账、
但数据暂时不会自动互相同步——要做到"我填的他也能看到"，需要一个**云端账本**（小服务器）。

接入方法（给开发者 / 进阶用户）：
- 在 `src/store.ts` 里把 `addTransaction / addTodo` 等动作同时写一份到云端
  （推荐免费方案 [Supabase](https://supabase.com) 的数据库 + 实时订阅），
  两人登录同一账号即可实时同步。
- 仓库已用 `zustand` 的 `persist` 做了本地存储，加云端只需在 actions 里补一行网络写入。

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
    ├── store.ts         # 本地持久化 + 示例数据 + 顺延逻辑
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

需要我帮你把"两人同步"接上 Supabase，或调整任何界面文案 / 配色，随时说。
