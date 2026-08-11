// 全局配色：奶油底 + 六色果冻，兔粉 / 虎橙 贯穿身份区分
export const theme = {
  bgScreen: "#FFF5F0",
  bgCard: "#FFFFFF",
  bgSoft: "#FFF3E6",
  textPrimary: "#2B2A33",
  textSecondary: "#8A8594",
  textMuted: "#B5B0BF",
  border: "#F1EAE2",

  rabbitPink: "#FF7EA8",
  rabbitPinkSoft: "#FFE6EF",
  tigerOrange: "#FF9F45",
  tigerOrangeSoft: "#FFEDD9",

  mint: "#3D9970",
  mintSoft: "#E0F5EA",
  sky: "#6FB2F5",
  skySoft: "#E3F0FF",
  lemon: "#FFCB47",
  lemonSoft: "#FFF3D6",
  lilac: "#A78BEA",
  lilacSoft: "#EFE8FF",
  coral: "#FF7E6B",
  coralSoft: "#FFE8E2",

  radiusCard: 24,
  radiusChip: 16,
  radiusPill: 100,
};

// 身份：兔 = 你，虎 = 老公
export const OWNER = {
  rabbit: { key: "rabbit", name: "小兔", color: "#FF7EA8", soft: "#FFE6EF", emoji: "🐰" },
  tiger: { key: "tiger", name: "小虎", color: "#FF9F45", soft: "#FFEDD9", emoji: "🐯" },
  shared: { key: "shared", name: "共同", color: "#A78BEA", soft: "#EFE8FF", emoji: "💞" },
} as const;

export type OwnerKey = keyof typeof OWNER;

// 分类定义：name 显示名 / type 收支配 / icon 图标名 / color 主题色
export interface Category {
  key: string;
  label: string;
  type: "expense" | "income";
  icon: string; // MaterialCommunityIcons 名称
  color: string;
  soft: string;
}

export const CATEGORIES: Category[] = [
  { key: "food", label: "餐饮", type: "expense", icon: "food-fork-drink", color: theme.rabbitPink, soft: theme.rabbitPinkSoft },
  { key: "transport", label: "交通", type: "expense", icon: "bus", color: theme.mint, soft: theme.mintSoft },
  { key: "shopping", label: "购物", type: "expense", icon: "shopping", color: theme.sky, soft: theme.skySoft },
  { key: "housing", label: "住房", type: "expense", icon: "home-variant", color: theme.lilac, soft: theme.lilacSoft },
  { key: "health", label: "健康", type: "expense", icon: "heart", color: theme.mint, soft: theme.mintSoft },
  { key: "comm", label: "通信", type: "expense", icon: "cellphone", color: theme.lilac, soft: theme.lilacSoft },
  { key: "other", label: "其他", type: "expense", icon: "dots-horizontal-circle", color: theme.textMuted, soft: theme.bgSoft },
  { key: "salary", label: "工资", type: "income", icon: "cash-multiple", color: theme.coral, soft: theme.coralSoft },
  { key: "reimburse", label: "报销", type: "income", icon: "file-check", color: theme.lemon, soft: theme.lemonSoft },
  { key: "idlefish", label: "闲鱼", type: "income", icon: "repeat", color: theme.sky, soft: theme.skySoft },
  { key: "meituan", label: "美团/点评", type: "income", icon: "store", color: theme.coral, soft: theme.coralSoft },
];

export const categoryByKey = (key: string): Category | undefined =>
  CATEGORIES.find((c) => c.key === key);
