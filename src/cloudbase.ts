/**
 * 腾讯云开发 CloudBase 客户端（HTTP，不依赖 @cloudbase/adapter-rn）。
 *
 * 官方 adapter-rn 要求 React Native 0.76+ / Expo 52+，本仓库是 Expo 51 / RN 0.74，
 * 因此直接调用 CloudBase HTTP API：匿名登录 + 文档型数据库 CRUD。
 * HTTP API 没有 .watch()，实时同步由 store 侧短间隔轮询完成。
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Transaction, Todo } from "./types";

const ENV_ID = "couple-ledger-d9gbsn9kl5582c5b1";
const REGION = "ap-shanghai";

/**
 * Publishable / App Access Key（公开客户端密钥，和 Firebase apiKey 同一类，可打进 App）。
 * 匿名登录本身不依赖它；保留在配置里用于 isConfigured 检查，以及与控制台密钥对应。
 */
const ACCESS_KEY =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL2NvdXBsZS1sZWRnZXItZDlnYnNuOWtsNTU4MmM1YjEuYXAtc2hhbmdoYWkudGNiLWFwaS50ZW5jZW50Y2xvdWRhcGkuY29tIiwic3ViIjoiYW5vbiIsImF1ZCI6ImNvdXBsZS1sZWRnZXItZDlnYnNuOWtsNTU4MmM1YjEiLCJleHAiOjQwOTA1NDAzOTksImlhdCI6MTc4Njg1NzE5OSwibm9uY2UiOiJ1U2dkMDN3QVFzdU1ZQ01reWpGWG53IiwiYXRfaGFzaCI6InVTZ2QwM3dBUXN1TVlDTWt5akZYbnciLCJuYW1lIjoiQW5vbnltb3VzIiwic3Njb3BlIjoiYW5vbnltb3VzIiwicHJvamVjdF9pZCI6ImNvdXBsZS1sZWRnZXItZDlnYnNuOWtsNTU4MmM1YjEiLCJtZXRhIjp7InBsYXRmb3JtIjoiUHVibGlzaGFibGVLZXkifSwidXNlcl90eXBlIjoiIiwiY2xpZW50X3R5cGUiOiJjbGllbnRfdXNlciIsImlzX3N5c3RlbV9hZG1pbiI6ZmFsc2V9.F_CTYsMwO9zkoGs2BOJIwovKaBvxXYeGsscGOSj8L6sydAUkhNqme43kty0yQuJtkjMIZJsyD5X9jwZ9NA2dc37IUHB7NWfK6RXr_gBDVtXkeB6z3MRP-k0eYOajv5VBZ0pFgLKTZGXwLwwg86VopRRTdFC-zyHbvvC7EwqJOarov37hmgyVGX9pTrZErEaksqMd3zfL6EZYa3yx2eLmt6ntxYhowAmNhqD0E5CIY_kEvCiGrBRZ7KcleWLjfUZAPm1gqdM3drWaQwG3aCbOipa7tuczr4ITc8fs1sO980w3lXA2ehUlOG38ohXUU9ma-sDuXiF3bzt8d1mFJ-coKA";

/** 身份认证（匿名登录 / 刷新 token） */
const AUTH_HOST = `https://${ENV_ID}.${REGION}.tcb-api.tencentcloudapi.com`;
/** 文档型数据库 HTTP API */
const API_HOST = `https://${ENV_ID}.api.tcloudbasegateway.com`;
const LEDGERS_PATH =
  "/v1/database/instances/(default)/databases/(default)/collections/ledgers/documents";

const DEVICE_KEY = "cloudbase-device-id";

export const cloudbaseConfig = {
  env: ENV_ID,
  region: REGION,
  accessKey: ACCESS_KEY,
  authHost: AUTH_HOST,
  apiHost: API_HOST,
};

/** 是否把占位符替换成了真实配置 */
export const isCloudBaseConfigured =
  Boolean(ENV_ID) && !String(ACCESS_KEY).startsWith("YOUR_");

export interface LedgerDoc {
  transactions: Transaction[];
  todos: Todo[];
  updatedAt: number;
}

interface TokenState {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

let tokens: TokenState | null = null;
let deviceIdPromise: Promise<string> | null = null;

function assertConfigured(): void {
  if (!isCloudBaseConfigured) {
    throw new Error("CloudBase 尚未配置：请在 src/cloudbase.ts 填入环境 ID 与 Publishable Key");
  }
}

async function getDeviceId(): Promise<string> {
  if (!deviceIdPromise) {
    deviceIdPromise = (async () => {
      const existing = await AsyncStorage.getItem(DEVICE_KEY);
      if (existing) return existing;
      const created =
        "cb_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
      await AsyncStorage.setItem(DEVICE_KEY, created);
      return created;
    })();
  }
  return deviceIdPromise;
}

/** 解开文档库返回的 Strict EJSON（$numberInt / $numberLong 等） */
export function fromEjson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(fromEjson);
  if (!value || typeof value !== "object") return value;
  const rec = value as Record<string, unknown>;
  if (typeof rec.$numberInt === "string") return parseInt(rec.$numberInt, 10);
  if (typeof rec.$numberLong === "string") return Number(rec.$numberLong);
  if (typeof rec.$numberDouble === "string") return Number(rec.$numberDouble);
  if (typeof rec.$numberDecimal === "string") return Number(rec.$numberDecimal);
  if (rec.$date && typeof rec.$date === "object") {
    const inner = rec.$date as Record<string, unknown>;
    if (typeof inner.$numberLong === "string") return Number(inner.$numberLong);
  }
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(rec)) out[key] = fromEjson(rec[key]);
  return out;
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function errorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const rec = body as Record<string, unknown>;
    if (typeof rec.message === "string" && rec.message) return rec.message;
    if (typeof rec.error_description === "string" && rec.error_description) {
      return rec.error_description;
    }
  }
  return fallback;
}

function applyTokenResponse(body: Record<string, unknown>): TokenState {
  const accessToken = String(body.access_token || "");
  const refreshToken = String(body.refresh_token || "");
  const expiresIn = Number(body.expires_in || 7200);
  if (!accessToken) {
    throw new Error(errorMessage(body, "匿名登录未返回 access_token"));
  }
  tokens = {
    accessToken,
    refreshToken,
    // 提前 60s 刷新，避免边界过期
    expiresAt: Date.now() + Math.max(60, expiresIn - 60) * 1000,
  };
  return tokens;
}

async function signInAnonymouslyRaw(deviceId: string): Promise<TokenState> {
  const res = await fetch(`${AUTH_HOST}/auth/v1/signin/anonymously`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-device-id": deviceId,
    },
    body: "{}",
  });
  const body = (await readJson(res)) as Record<string, unknown> | null;
  if (!res.ok) {
    throw new Error(errorMessage(body, `匿名登录失败（HTTP ${res.status}）`));
  }
  return applyTokenResponse(body || {});
}

async function refreshAccessToken(deviceId: string): Promise<TokenState> {
  if (!tokens?.refreshToken) {
    return signInAnonymouslyRaw(deviceId);
  }
  const res = await fetch(`${AUTH_HOST}/auth/v1/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-device-id": deviceId,
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
      client_id: ENV_ID,
    }),
  });
  const body = (await readJson(res)) as Record<string, unknown> | null;
  if (!res.ok) {
    tokens = null;
    return signInAnonymouslyRaw(deviceId);
  }
  return applyTokenResponse(body || {});
}

/** 匿名登录：每台设备一个匿名用户，满足「已登录才能读写账本」 */
export async function anonymousSignIn(): Promise<void> {
  assertConfigured();
  const deviceId = await getDeviceId();
  if (tokens && Date.now() < tokens.expiresAt) return;
  if (tokens?.refreshToken) {
    await refreshAccessToken(deviceId);
    return;
  }
  await signInAnonymouslyRaw(deviceId);
}

async function getAccessToken(): Promise<string> {
  await anonymousSignIn();
  if (!tokens) throw new Error("CloudBase 未登录");
  return tokens.accessToken;
}

function ledgerUrl(ledgerId: string): string {
  return `${API_HOST}${LEDGERS_PATH}/${encodeURIComponent(ledgerId)}`;
}

async function dbFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(init.headers as Record<string, string> | undefined),
  };
  return fetch(url, { ...init, headers });
}

export async function getLedger(ledgerId: string): Promise<LedgerDoc | null> {
  const res = await dbFetch(ledgerUrl(ledgerId));
  const body = fromEjson(await readJson(res));
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(errorMessage(body, `读取账本失败（HTTP ${res.status}）`));
  }
  const rec = (body || {}) as Record<string, unknown>;
  return {
    transactions: Array.isArray(rec.transactions) ? (rec.transactions as Transaction[]) : [],
    todos: Array.isArray(rec.todos) ? (rec.todos as Todo[]) : [],
    updatedAt: typeof rec.updatedAt === "number" ? rec.updatedAt : 0,
  };
}

export async function createLedger(
  ledgerId: string,
  data: { transactions: Transaction[]; todos: Todo[]; updatedAt: number }
): Promise<void> {
  const res = await dbFetch(`${API_HOST}${LEDGERS_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [{ _id: ledgerId, ...data }],
    }),
  });
  const body = await readJson(res);
  if (res.status === 201 || res.ok) return;
  // 另一台手机可能已经抢先创建
  const msg = errorMessage(body, "");
  if (res.status === 409 || /duplicate/i.test(msg) || /E11000/.test(msg)) return;
  throw new Error(msg || `创建账本失败（HTTP ${res.status}）`);
}

export async function updateLedger(
  ledgerId: string,
  partial: { transactions?: Transaction[]; todos?: Todo[]; updatedAt: number }
): Promise<void> {
  const res = await dbFetch(ledgerUrl(ledgerId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: partial }),
  });
  const body = await readJson(res);
  if (res.ok) return;
  if (res.status === 404) {
    const current = partial;
    await createLedger(ledgerId, {
      transactions: current.transactions ?? [],
      todos: current.todos ?? [],
      updatedAt: current.updatedAt,
    });
    return;
  }
  throw new Error(errorMessage(body, `同步写入失败（HTTP ${res.status}）`));
}

export function clearCloudBaseSession(): void {
  tokens = null;
}
