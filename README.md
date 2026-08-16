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

## 三、两人云端同步（已接入腾讯云 CloudBase，国内可访问）

数据走 **腾讯云开发 CloudBase** 文档型数据库：你俩在「我们」页填**同一个账本 ID**，
点「连接」，两台手机即互相同步——我记一笔，对方过一两秒就能看到。
`src/store.ts` 在连接后轮询 `ledgers/{ledgerId}`；断网时退回本机本地（AsyncStorage），
未连接时完全本地可用。

> 原先用过 Firebase，但大陆网络经常连不上，已整体换成 CloudBase（上海，免费体验版）。

### 环境（已创建，不必再新建）
| 项 | 值 |
| --- | --- |
| 显示名 | couple-ledger |
| 环境 ID | `couple-ledger-d9gbsn9kl5582c5b1` |
| 地域 | `ap-shanghai`（上海） |
| 套餐 | 免费体验版 |
| 文档库集合 | `ledgers`（已建） |
| 匿名登录 | 已开启 |

客户端配置在 `src/cloudbase.ts`（环境 ID + Publishable / App Access Key）。
Publishable Key 和 Firebase 的 apiKey 同一类：**可以打进 App**，不是服务端 Secret。
账本 ID 才是你们俩的「共享钥匙」，谁知道它谁就能读写该账本，请勿外泄。

实名认证和兑换码已经用过。免费体验版大约每 **6 个月需要在控制台手动续期**，过期后同步会失败。

### 启用同步
1. 控制台确认：匿名登录已开、集合 `ledgers` 已建，且登录用户（含匿名）可读写该集合。
2. `npm install` 后重新打包 APK（见第一节）。两台手机都装上后，在「我们」页
   填同一个账本 ID 点「连接」即可。

权限模型：任意已登录用户（包括匿名）可读写 `ledgers/{id}`；安全靠账本 ID 保密，
不再使用 Firebase `firestore.rules`。

### 为什么不用官方 RN SDK
`@cloudbase/adapter-rn` 要求 React Native 0.76+ / Expo 52+。本仓库保持 **Expo 51 / RN 0.74**，
用官方 HTTP API（`tcb-api.tencentcloudapi.com` 登录，`api.tcloudbasegateway.com` 读写文档）。
HTTP API 没有 `.watch()`，因此用 2.5 秒轮询近似实时，而不是 WebSocket。

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
    ├── cloudbase.ts     # CloudBase HTTP 客户端（匿名登录 + 文档库）
    ├── store.ts         # 本地持久化 + CloudBase 同步 + 示例数据 + 顺延逻辑
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

需要调整界面文案 / 配色，随时说。
