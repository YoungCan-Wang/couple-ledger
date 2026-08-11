import React from "react";
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useStore } from "../store";
import { theme } from "../theme";
import { todayISO } from "../types";

export default function DailyPush() {
  const todos = useStore((s) => s.todos);
  const t = todayISO();
  const undone = todos.filter((x) => x.dueDate === t && !x.done).map((x) => x.text);

  const WEEK = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const d = new Date();
  const next = new Date();
  next.setDate(d.getDate() + 1);
  const sub = `${next.getMonth() + 1}月${next.getDate()}日 ${WEEK[next.getDay()]}`;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>每日推送</Text>
          <Text style={styles.sub}>{sub} · 早安</Text>
        </View>

        {/* 早安简报 */}
        <View style={styles.card}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>☀ 08:00 早安简报</Text>
          </View>
          <Text style={styles.newsTitle}>5 分钟看懂今天</Text>
          <Text style={styles.newsBody}>
            · 央行释放流动性，MLF 利率下调 10 个基点{"\n"}·
            新能源汽车 7 月销量同比增长超 30%{"\n"}· 南方高温天气持续，需注意防暑
          </Text>
        </View>

        {/* 天气卡片 */}
        <LinearGradient colors={["#6FB2F5", "#7B6CD9"]} style={styles.weather}>
          <Text style={styles.wxIcon}>⛅</Text>
          <View style={styles.wxText}>
            <Text style={styles.wxTemp}>北京  26°C · 多云</Text>
            <Text style={styles.wxTip}>明天有雨，出门记得带伞</Text>
          </View>
        </LinearGradient>

        {/* 待办提醒 */}
        <View style={styles.card}>
          <Text style={styles.remTitle}>17:40 待办总结</Text>
          {undone.length > 0 ? (
            <Text style={styles.remBody}>
              今天还有 {undone.length} 件事没完成：{"\n"}·
              {undone.join("\n·")}
              {"\n\n"}未完成事项会自动进入明天清单。
            </Text>
          ) : (
            <Text style={styles.remBody}>今天的事项都完成啦，辛苦了 🎉</Text>
          )}
        </View>
        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bgScreen },
  content: { padding: 20, gap: 16 },
  header: { gap: 4 },
  title: { fontSize: 20, fontWeight: "600", color: theme.textPrimary },
  sub: { fontSize: 13, color: theme.textMuted },
  card: {
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
  tag: {
    alignSelf: "flex-start",
    backgroundColor: theme.tigerOrangeSoft,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { fontSize: 11, fontWeight: "600", color: theme.tigerOrange },
  newsTitle: { fontSize: 16, fontWeight: "600", color: theme.textPrimary },
  newsBody: { fontSize: 13, color: theme.textSecondary, lineHeight: 22 },
  weather: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  wxIcon: { fontSize: 40 },
  wxText: { flex: 1, gap: 4 },
  wxTemp: { fontSize: 18, fontWeight: "600", color: "#fff" },
  wxTip: { fontSize: 13, color: "#fff", opacity: 0.9 },
  remTitle: { fontSize: 14, fontWeight: "600", color: theme.textPrimary },
  remBody: { fontSize: 13, color: theme.textSecondary, lineHeight: 22 },
});
