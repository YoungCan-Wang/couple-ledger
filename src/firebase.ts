// 必须放在最顶部：为 React Native 提供 crypto.getRandomValues，匿名登录才不会报 crypto 错误
import "react-native-get-random-values";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, signInAnonymously, type Auth } from "firebase/auth";
import { initializeFirestore, memoryLocalCache, type Firestore } from "firebase/firestore";

/**
 * ⚠️ 把下面的占位符替换成你自己的 Firebase 项目配置。
 * 获取路径：Firebase 控制台 → 项目设置 → 「你的应用」→ SDK 配置（apiKey 等）。
 * 注意：这些值是公开的（打包进 App 也安全），真正的权限由 Firestore 安全规则控制。
 */
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

/** 是否把占位符替换成了真实配置 */
export const isFirebaseConfigured = !String(firebaseConfig.apiKey).startsWith("YOUR_");

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

/** 惰性初始化 Firebase（避免在没有配置时报错） */
export function getFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase 尚未配置：请在 src/firebase.ts 填入你的项目配置");
  }
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    // RN 没有 IndexedDB，显式用内存缓存，避免运行时报缓存错误（实时同步需联网）
    dbInstance = initializeFirestore(app, { localCache: memoryLocalCache() });
    authInstance = getAuth(app);
  }
  return { app, auth: authInstance!, db: dbInstance! };
}

/** 匿名登录：每个设备一个匿名 UID，仅用于满足安全规则的 request.auth != null */
export async function anonymousSignIn(): Promise<void> {
  const { auth } = getFirebase();
  if (auth.currentUser) return;
  await signInAnonymously(auth);
}
