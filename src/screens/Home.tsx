import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useStore } from "../store";
import { theme, OWNER, categoryByKey } from "../theme";
import { todayISO } from "../types";
import Mascot from "../components/Mascot";
import CategoryIcon from "../components/CategoryIcon";

const WEEK = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

const fmtDate = () => {
  const d = new Date();
  return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEK[d.getDay()]}`;
};

export default function Home() {
  const transactions = useStore((s) => s.transactions);
  const quote = useStore((s) => s.quote);

  const month = new Date().getMonth();
  const monthTx = transactions.filter((t) => new Date(t.date).getMonth() === month);
  const income = monthTx.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const balance = income - expense;

  const t = todayISO();
  const todayTx = transactions.filter((x) => x.date === t);
  const rabbitToday = todayTx
    .filter((x) => x.owner === "rabbit" && x.type === "expense")
    .reduce((a, b) => a + b.amount, 0);
  const tigerToday = todayTx
    .filter((x) => x.owner === "tiger" && x.type === "expense")
    .reduce((a, b) => a + b.amount, 0);
  const rabbitCount = todayTx.filter((x) => x.owner === "rabbit").length;
  const tigerCount = todayTx.filter((x) => x.owner === "tiger").length;

  const recent = transactions.slice(0, 4);

  const money = (n: number) =>
    n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 顶部问候 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.date}>{fmtDate()}</Text>
            <Text style={styles.greet}>早安，小兔 ✦</Text>
          </View>
          <View style={styles.avatars}>
            <Mascot owner="rabbit" size={36} />
            <View style={{ marginLeft: -10 }}>
              <Mascot owner="tiger" size={36} />
            </View>
          </View>
        </View>

        {/* 每日一句（常驻，不推送） */}
        <View style={styles.quote}>
          <View style={styles.quoteTag}>
            <Text style={styles.quoteTagText}>今日灵感</Text>
          </View>
          <Text style={styles.quoteText}>“{quote}”</Text>
          <Text style={styles.quoteAuthor}>—— 木心《从前慢》</Text>
        </View>

        {/* 本月结余 */}
        <LinearGradient colors={["#FF8A5C", "#FF6B9E"]} style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>本月结余</Text>
            <Text style={styles.heroEye}>👁</Text>
          </View>
          <Text style={styles.heroAmount}>¥ {money(balance)}</Text>
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroSub}>收入</Text>
              <Text style={styles.heroNum}>¥ {money(income)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroSub}>支出</Text>
              <Text style={styles.heroNum}>¥ {money(expense)}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* 今日双人支出 */}
        <View style={styles.todayRow}>
          <View style={[styles.todayCard, { backgroundColor: theme.rabbitPinkSoft }]}>
            <View style={styles.todayHead}>
              <Mascot owner="rabbit" size={22} />
              <Text style={[styles.todayName, { color: theme.rabbitPink }]}>小兔</Text>
            </View>
            <Text style={styles.todayAmount}>¥ {money(rabbitToday)}</Text>
            <Text style={styles.todayCount}>{rabbitCount} 笔</Text>
          </View>
          <View style={[styles.todayCard, { backgroundColor: theme.tigerOrangeSoft }]}>
            <View style={styles.todayHead}>
              <Mascot owner="tiger" size={22} />
              <Text style={[styles.todayName, { color: theme.tigerOrange }]}>小虎</Text>
            </View>
            <Text style={styles.todayAmount}>¥ {money(tigerToday)}</Text>
            <Text style={styles.todayCount}>{tigerCount} 笔</Text>
          </View>
        </View>

        {/* 最近明细 */}
        <View style={styles.txHead}>
          <Text style={styles.txTitle}>最近明细</Text>
          <Text style={styles.txMore}>查看全部 ›</Text>
        </View>
        {recent.map((tx) => {
          const cat = categoryByKey(tx.category);
          const ownerName = tx.owner === "shared" ? "共同" : OWNER[tx.owner].name;
          const isIncome = tx.type === "income";
          return (
            <View key={tx.id} style={styles.txItem}>
              <CategoryIcon categoryKey={tx.category} size={22} />
              <View style={styles.txInfo}>
                <Text style={styles.txCat}>
                  {cat?.label} · {ownerName}
                </Text>
                <Text style={styles.txTime}>{tx.date}</Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  { color: isIncome ? theme.mint : theme.textPrimary },
                ]}
              >
                {isIncome ? "+" : "-"}¥ {money(tx.amount)}
              </Text>
            </View>
          );
        })}
        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bgScreen },
  content: { padding: 20, gap: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  date: { fontSize: 13, color: theme.textMuted },
  greet: { fontSize: 20, fontWeight: "600", color: theme.textPrimary, marginTop: 4 },
  avatars: { flexDirection: "row", alignItems: "center" },
  quote: {
    backgroundColor: theme.bgCard,
    borderRadius: theme.radiusCard,
    padding: 20,
    gap: 12,
    shadowColor: "#6B6B80",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 3,
  },
  quoteTag: {
    alignSelf: "flex-start",
    backgroundColor: theme.lilacSoft,
    borderRadius: theme.radiusChip,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  quoteTagText: { fontSize: 11, fontWeight: "600", color: theme.lilac },
  quoteText: { fontSize: 16, fontWeight: "500", color: theme.textPrimary, lineHeight: 26 },
  quoteAuthor: { fontSize: 12, color: theme.textSecondary, textAlign: "right" },
  hero: {
    borderRadius: theme.radiusCard,
    padding: 24,
    gap: 14,
    shadowColor: "#FF7E6B",
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 28,
    elevation: 6,
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroLabel: { fontSize: 14, fontWeight: "600", color: "#fff", opacity: 0.92 },
  heroEye: { fontSize: 16 },
  heroAmount: { fontSize: 40, fontWeight: "800", color: "#fff" },
  heroRow: { flexDirection: "row", gap: 16 },
  heroSub: { fontSize: 12, color: "#fff", opacity: 0.85 },
  heroNum: { fontSize: 18, fontWeight: "700", color: "#fff", marginTop: 2 },
  todayRow: { flexDirection: "row", gap: 12 },
  todayCard: { flex: 1, borderRadius: 20, padding: 16, gap: 6 },
  todayHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  todayName: { fontSize: 13, fontWeight: "600" },
  todayAmount: { fontSize: 22, fontWeight: "800", color: theme.textPrimary },
  todayCount: { fontSize: 12, color: theme.textSecondary },
  txHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  txTitle: { fontSize: 16, fontWeight: "600", color: theme.textPrimary },
  txMore: { fontSize: 13, color: theme.textMuted },
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.bgCard,
    borderRadius: 16,
    padding: 14,
  },
  txInfo: { flex: 1, marginLeft: 12, gap: 2 },
  txCat: { fontSize: 14, fontWeight: "500", color: theme.textPrimary },
  txTime: { fontSize: 12, color: theme.textMuted },
  txAmount: { fontSize: 16, fontWeight: "700" },
});
