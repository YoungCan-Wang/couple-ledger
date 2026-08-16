import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { type Transaction, type Todo, type Reminders, todayISO, uid } from "./types";
import {
  anonymousSignIn,
  clearCloudBaseSession,
  createLedger,
  getLedger,
  isCloudBaseConfigured,
  updateLedger,
} from "./cloudbase";

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

// 模块级：当前云端账本与轮询（不进 store，避免重复渲染）
// HTTP API 无 .watch()，用短间隔 GET 近似实时
const POLL_MS = 2500;
let activeLedgerId: string | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let lastAppliedAt = 0;
let lastPushedAt = 0;
let pollFails = 0;

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
      const stopWatch = () => {
        if (pollTimer) {
          clearInterval(pollTimer);
          pollTimer = null;
        }
        activeLedgerId = null;
        lastAppliedAt = 0;
        lastPushedAt = 0;
        pollFails = 0;
      };

      // 已同步时把最新数组写回云端（PATCH 只更新对应字段）
      const pushLedger = (partial: { transactions?: Transaction[]; todos?: Todo[] }) => {
        const id = activeLedgerId;
        if (id && get().syncStatus === "synced") {
          const updatedAt = Date.now();
          lastPushedAt = updatedAt;
          updateLedger(id, { ...partial, updatedAt }).catch(() => {
            set({ syncStatus: "error", syncError: "同步写入失败，请检查网络" });
          });
        }
      };

      const applyRemote = async (id: string, isFirst: boolean) => {
        const doc = await getLedger(id);
        if (!doc) {
          if (isFirst) {
            const s = get();
            const updatedAt = Date.now();
            lastPushedAt = updatedAt;
            await createLedger(id, {
              transactions: s.transactions,
              todos: s.todos,
              updatedAt,
            });
            const again = await getLedger(id);
            if (again) {
              lastAppliedAt = again.updatedAt || updatedAt;
              set({
                transactions: again.transactions,
                todos: again.todos,
                syncStatus: "synced",
                syncError: "",
              });
            } else {
              lastAppliedAt = updatedAt;
              set({ syncStatus: "synced", syncError: "" });
            }
          }
          return;
        }
        if (doc.updatedAt && doc.updatedAt < lastPushedAt) return;
        if (doc.updatedAt && doc.updatedAt === lastAppliedAt) return;
        lastAppliedAt = doc.updatedAt || lastAppliedAt;
        set({
          transactions: doc.transactions,
          todos: doc.todos,
          syncStatus: "synced",
          syncError: "",
        });
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
          if (!isCloudBaseConfigured) {
            set({ syncStatus: "error", syncError: "CloudBase 未配置（见 src/cloudbase.ts）" });
            return;
          }
          stopWatch();
          set({ syncStatus: "connecting", syncError: "" });
          try {
            await anonymousSignIn();
            activeLedgerId = id;
            await applyRemote(id, true);
            if (get().syncStatus === "error") return;
            pollTimer = setInterval(() => {
              applyRemote(id, false)
                .then(() => {
                  pollFails = 0;
                })
                .catch((err: { message?: string }) => {
                  pollFails += 1;
                  if (pollFails >= 3) {
                    set({
                      syncStatus: "error",
                      syncError: err?.message || "云端同步失败",
                    });
                  }
                });
            }, POLL_MS);
            if (get().syncStatus === "connecting") {
              set({ syncStatus: "synced", syncError: "" });
            }
          } catch (e: any) {
            stopWatch();
            set({ syncStatus: "error", syncError: e?.message || "连接失败" });
          }
        },

        disconnect: () => {
          stopWatch();
          clearCloudBaseSession();
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
      // syncStatus 不落盘：重启后先回到 local，再按 ledgerId 重连
      partialize: (s) => ({
        transactions: s.transactions,
        todos: s.todos,
        reminders: s.reminders,
        quote: s.quote,
        ledgerId: s.ledgerId,
      }),
    }
  )
);
