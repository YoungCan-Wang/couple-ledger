import type { OwnerKey } from "./theme";

export interface Transaction {
  id: string;
  owner: OwnerKey; // rabbit | tiger | shared
  type: "expense" | "income";
  category: string; // Category.key
  amount: number;
  note?: string;
  date: string; // ISO yyyy-mm-dd
  createdAt: number;
}

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  dueDate: string; // ISO yyyy-mm-dd
  carriedOver?: boolean; // 是否由昨天顺延而来
  createdAt: number;
}

export interface Reminders {
  morning: boolean; // 早安简报 08:00
  evening: boolean; // 晚间总结 17:40
  weather: boolean; // 明日天气 22:00
  quote: boolean; // 每日一句（已按你的要求关闭提醒）
}

export const todayISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

export const uid = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
