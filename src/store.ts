import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { doc, onSnapshot, setDoc, type DocumentReference } from "firebase/firestore";

import { type Transaction, type Todo, type Reminders, todayISO, uid } from "./types";
import { getFirebase, anonymousSignIn, isFirebaseConfigured } from "./firebase";

export type SyncStatus = "local" | "connecting" | "synced" | "error";

interface State {
  transactions: Transaction[];
  todos: Todo[];
  reminders: Reminders;
  quote: string; // 首页常驻金句（不推送）
  ledgerId: string; // 共享账本 ID（双人配对用）
  syncStatus: SyncStatus;
  syncError: string;
  // 操作
  setLedgerId: (id: string) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => void;
  deleteTransaction: (id: string) => void;
  addTodo: (text: string, dueDate?: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  carryOverTodos: () => void;
  setReminder: (key: keyof Reminders, value: boolean) => void;
}

// 模块级：当前云端账本引用与监听器（不进 store，避免重复渲染）
let fbRef: DocumentReference | null = null;
let unsub: (() => void) | null = null;

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
    (set, get) => {
      // 已同步时把最新数组写回云端（merge 只更新对应字段）
      const pushLedger = (partial: { transactions?: Transaction[]; todos?: Todo[] }) => {
        if (fbRef && get().syncStatus === "synced") {
          setDoc(fbRef, { ...partial, updatedAt: Date.now() }, { merge: true }).catch(() => {
            set({ syncStatus: "error", syncError: "同步写入失败，请检查网络" });
          });
        }
      };

      return {
        ...seed(),
        ledgerId: "",
        syncStatus: "local",
        syncError: "",

        setLedgerId: (id) => set({ ledgerId: id.trim() }),

        connect: async () => {
          const id = get().ledgerId.trim();
          if (!id) {
            set({ syncStatus: "error", syncError: "请先填写共享账本 ID" });
            return;
          }
          if (!isFirebaseConfigured) {
            set({ syncStatus: "error", syncError: "Firebase 未配置（见 src/firebase.ts）" });
            return;
          }
          set({ syncStatus: "connecting", syncError: "" });
          try {
            const { db } = getFirebase();
            await anonymousSignIn();
            fbRef = doc(db, "ledgers", id);
            unsub = onSnapshot(
              fbRef,
              (snap) => {
                if (!snap.exists()) {
                  // 首次连接：用本地现有数据初始化云端账本
                  const s = get();
                  setDoc(
                    fbRef!,
                    { transactions: s.transactions, todos: s.todos, updatedAt: Date.now() },
                    { merge: true }
                  );
                  set({ syncStatus: "synced" });
                  return;
                }
                const data = snap.data() as { transactions?: Transaction[]; todos?: Todo[] };
                set({
                  transactions: data.transactions ?? [],
                  todos: data.todos ?? [],
                  syncStatus: "synced",
                });
              },
              (err) => {
                set({ syncStatus: "error", syncError: err.message || "实时同步失败" });
              }
            );
          } catch (e: any) {
            set({ syncStatus: "error", syncError: e?.message || "连接失败" });
          }
        },

        disconnect: () => {
          if (unsub) {
            unsub();
            unsub = null;
          }
          fbRef = null;
          set({ syncStatus: "local", syncError: "" });
        },

        addTransaction: (t) => {
          const transactions = [{ ...t, id: uid(), createdAt: Date.now() }, ...get().transactions];
          set({ transactions });
          pushLedger({ transactions });
        },

        deleteTransaction: (id) => {
          const transactions = get().transactions.filter((x) => x.id !== id);
          set({ transactions });
          pushLedger({ transactions });
        },

        addTodo: (text, dueDate) => {
          const todos = [
            ...get().todos,
            { id: uid(), text, done: false, dueDate: dueDate || todayISO(), createdAt: Date.now() },
          ];
          set({ todos });
          pushLedger({ todos });
        },

        toggleTodo: (id) => {
          const todos = get().todos.map((x) => (x.id === id ? { ...x, done: !x.done } : x));
          set({ todos });
          pushLedger({ todos });
        },

        deleteTodo: (id) => {
          const todos = get().todos.filter((x) => x.id !== id);
          set({ todos });
          pushLedger({ todos });
        },

        // 把"昨天没完成"的待办顺延到今天
        carryOverTodos: () => {
          const t = todayISO();
          let changed = false;
          const todos = get().todos.map((x) => {
            if (!x.done && x.dueDate < t) {
              changed = true;
              return { ...x, dueDate: t, carriedOver: true };
            }
            return x;
          });
          if (changed) {
            set({ todos });
            pushLedger({ todos });
          }
        },

        setReminder: (key, value) =>
          set((s) => ({ reminders: { ...s.reminders, [key]: value } })),
      };
    },
    {
      name: "couple-ledger-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
