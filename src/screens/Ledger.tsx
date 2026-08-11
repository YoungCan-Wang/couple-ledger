import React from "react";
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useStore } from "../store";
import { theme, OWNER, CATEGORIES } from "../theme";

const money = (n: number) =>
  n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Ledger() {
  const transactions = useStore((s) => s.transactions);
  const month = new Date().getMonth();
  const monthTx = transactions.filter((t) => new Date(t.date).getMonth() === month);

  const income = monthTx.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const balance = income - expense;

  const rabbitExp = monthTx
    .filter((t) => t.owner === "rabbit" && t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);
  const tigerExp = monthTx
    .filter((t) => t.owner === "tiger" && t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  // 支出分类 TOP
  const byCat: Record<string, number> = {};
  monthTx
    .filter((t) => t.type === "expense")
    .forEach((t) => (byCat[t.category] = (byCat[t.category] || 0) + t.amount));
  const top = Object.entries(byCat)
    .map(([key, val]) => ({ key, val }))
    .sort((a, b) => b.val - a.val)
    .slice(0, 5);
  const max = Math.max(1, ...top.map((x) => x.val));

  // 收入来源
  const byInc: Record<string, number> = {};
  monthTx
    .filter((t) => t.type === "income")
    .forEach((t) => (byInc[t.category] = (byInc[t.category] || 0) + t.amount));
  const incomeCats = Object.entries(byInc).map(([key, val]) => ({ key, val }));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>本月账单</Text>
          <View style={styles.monthChip}>
            <Text style={styles.monthText}>{new Date().getFullYear()}年{month + 1}月 ▾</Text>
          </View>
        </View>

        {/* 结余卡片 */}
        <LinearGradient colors={["#6FB2F5", "#7B6CD9"]} style={styles.hero}>
          <Text style={styles.heroLabel}>本月结余</Text>
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

        {/* 双人对比 */}
        <View style={styles.card}>
          <View style={styles.cmpHead}>
            <Text style={styles.cmpTitle}>谁花得更多？</Text>
            <Text style={styles.cmpSub}>本月支出对比</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${Math.min(100, (rabbitExp / (rabbitExp + tigerExp || 1)) * 100)}%`, backgroundColor: theme.rabbitPink }]} />
          </View>
          <View style={styles.legend}>
            <View style={styles.legItem}>
              <View style={[styles.dot, { backgroundColor: theme.rabbitPink }]} />
              <Text style={styles.legText}>小兔 ¥ {money(rabbitExp)}</Text>
            </View>
            <View style={styles.legItem}>
              <View style={[styles.dot, { backgroundColor: theme.tigerOrange }]} />
              <Text style={styles.legText}>小虎 ¥ {money(tigerExp)}</Text>
            </View>
          </View>
        </View>

        {/* 支出分类 TOP5 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>支出分类 TOP5</Text>
          <View style={{ gap: 12 }}>
            {top.map((c) => {
              const cat = CATEGORIES.find((x) => x.key === c.key);
              return (
                <View key={c.key}>
                  <View style={[styles.barTrack, { backgroundColor: cat?.soft }]}>
                    <View style={[styles.bar, { width: `${(c.val / max) * 100}%`, backgroundColor: cat?.color }]} />
                  </View>
                  <View style={styles.barLabel}>
                    <Text style={styles.barName}>{cat?.label}</Text>
                    <Text style={styles.barVal}>¥ {money(c.val)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 收入来源 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>收入来源</Text>
          <View style={styles.chips}>
            {incomeCats.map((c) => {
              const cat = CATEGORIES.find((x) => x.key === c.key);
              return (
                <View key={c.key} style={[styles.chip, { backgroundColor: cat?.soft }]}>
                  <Text style={[styles.chipText, { color: cat?.color }]}>
                    {cat?.label} ¥ {money(c.val)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bgScreen },
  content: { padding: 20, gap: 18 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "600", color: theme.textPrimary },
  monthChip: { backgroundColor: theme.bgCard, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  monthText: { fontSize: 13, color: theme.textSecondary },
  hero: {
    borderRadius: theme.radiusCard,
    padding: 24,
    gap: 14,
    shadowColor: "#6FB2F5",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 28,
    elevation: 6,
  },
  heroLabel: { fontSize: 14, fontWeight: "600", color: "#fff", opacity: 0.9 },
  heroAmount: { fontSize: 36, fontWeight: "800", color: "#fff" },
  heroRow: { flexDirection: "row", gap: 16 },
  heroSub: { fontSize: 12, color: "#fff", opacity: 0.85 },
  heroNum: { fontSize: 16, fontWeight: "700", color: "#fff", marginTop: 2 },
  card: {
    backgroundColor: theme.bgCard,
    borderRadius: theme.radiusCard,
    padding: 18,
    gap: 14,
    shadowColor: "#6B6B80",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 2,
  },
  cmpHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cmpTitle: { fontSize: 15, fontWeight: "600", color: theme.textPrimary },
  cmpSub: { fontSize: 12, color: theme.textMuted },
  track: { height: 12, borderRadius: 6, backgroundColor: theme.tigerOrangeSoft, overflow: "hidden" },
  bar: { height: 12, borderRadius: 6 },
  legend: { flexDirection: "row", gap: 20 },
  legItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legText: { fontSize: 12, color: theme.textSecondary },
  cardTitle: { fontSize: 15, fontWeight: "600", color: theme.textPrimary },
  barTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  barLabel: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  barName: { fontSize: 12, color: theme.textSecondary },
  barVal: { fontSize: 12, fontWeight: "600", color: theme.textPrimary },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { fontSize: 12 },
});
