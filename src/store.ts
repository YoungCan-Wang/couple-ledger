import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { type Transaction, type Todo, type Reminders, todayISO, uid } from "./types";

interface State {
  transactions: Transaction[];
  todos: Todo[];
  reminders: Reminders;
  quote: string; // 首页常驻金句（不推送）
  // 操作
  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => void;
  deleteTransaction: (id: string) => void;
  addTodo: (text: string, dueDate?: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  carryOverTodos: () => void;
  setReminder: (key: keyof Reminders, value: boolean) => void;
}

const yesterdayISO = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const seed = () => {
  const t = todayISO();
  const y = yesterdayISO();
  return {
    transactions: [
      { id: uid(), owner: "rabbit", type: "expense", category: "food", amount: 48, note: "午餐", date: t, createdAt: Date.now() - 3600_000 },
      { id: uid(), owner: "tiger", type: "expense", category: "transport", amount: 24.5, note: "地铁", date: t, createdAt: Date.now() - 7200_000 },
      { id: uid(), owner: "rabbit", type: "expense", category: "shopping", amount: 86, note: "日用品", date: t, createdAt: Date.now() - 9000_000 },
      { id: uid(), owner: "shared", type: "income", category: "salary", amount: 6250, note: "工资", date: y, createdAt: Date.now() - 86400_000 },
      { id: uid(), owner: "rabbit", type: "income", category: "idlefish", amount: 140, note: "闲置出手", date: y, createdAt: Date.now() - 90000_000 },
    ] as Transaction[],
    todos: [
      { id: uid(), text: "去超市买牛奶和鸡蛋", done: false, dueDate: t, createdAt: Date.now() },
      { id: uid(), text: "交物业费", done: false, dueDate: t, createdAt: Date.now() },
      { id: uid(), text: "晨起读新闻 5 分钟", done: true, dueDate: t, createdAt: Date.now() },
      { id: uid(), text: "整理衣柜", done: false, dueDate: y, createdAt: Date.now() },
      { id: uid(), text: "给小虎打电话问加班", done: false, dueDate: y, createdAt: Date.now() },
    ] as Todo[],
    reminders: { morning: true, evening: true, weather: true, quote: false } as Reminders,
    quote: "从前的日色变得慢，车，马，邮件都慢，一生只够爱一个人。",
  };
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      ...seed(),

      addTransaction: (t) =>
        set((s) => ({
          transactions: [
            { ...t, id: uid(), createdAt: Date.now() },
            ...s.transactions,
          ],
        })),

      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),

      addTodo: (text, dueDate) =>
        set((s) => ({
          todos: [
            ...s.todos,
            { id: uid(), text, done: false, dueDate: dueDate || todayISO(), createdAt: Date.now() },
          ],
        })),

      toggleTodo: (id) =>
        set((s) => ({
          todos: s.todos.map((x) => (x.id === id ? { ...x, done: !x.done } : x)),
        })),

      deleteTodo: (id) =>
        set((s) => ({ todos: s.todos.filter((x) => x.id !== id) })),

      // 把"昨天没完成"的待办顺延到今天
      carryOverTodos: () =>
        set((s) => {
          const t = todayISO();
          let changed = false;
          const todos = s.todos.map((x) => {
            if (!x.done && x.dueDate < t) {
              changed = true;
              return { ...x, dueDate: t, carriedOver: true };
            }
            return x;
          });
          return changed ? { todos } : {};
        }),

      setReminder: (key, value) =>
        set((s) => ({ reminders: { ...s.reminders, [key]: value } })),
    }),
    {
      name: "couple-ledger-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
