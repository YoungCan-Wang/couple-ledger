import React from "react";
import { View, Text, ScrollView, Switch, StyleSheet, SafeAreaView, TextInput, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useStore } from "../store";
import { theme } from "../theme";
import Mascot from "../components/Mascot";

const TOGGLES: { key: keyof ReturnType<typeof useStore.getState>["reminders"]; label: string; time: string }[] = [
  { key: "morning", label: "早安简报", time: "08:00" },
  { key: "evening", label: "晚间总结", time: "17:40" },
  { key: "weather", label: "明日天气", time: "22:00" },
  { key: "quote", label: "每日一句", time: "07:00（已关闭提醒）" },
];

export default function Us() {
  const reminders = useStore((s) => s.reminders);
  const setReminder = useStore((s) => s.setReminder);

  // 共享账本配对
  const ledgerId = useStore((s) => s.ledgerId);
  const syncStatus = useStore((s) => s.syncStatus);
  const syncError = useStore((s) => s.syncError);
  const setLedgerId = useStore((s) => s.setLedgerId);
  const connect = useStore((s) => s.connect);
  const disconnect = useStore((s) => s.disconnect);

  const statusText: Record<string, string> = {
    local: "仅本机（未同步）",
    connecting: "连接中…",
    synced: "已实时同步 · 双人共享",
    error: syncError || "同步出错",
  };

  // 在一起天数：固定一个纪念日做示例
  const start = new Date("2023-02-10").getTime();
  const days = Math.floor((Date.now() - start) / 86400000);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>我们</Text>

        {/* 情侣卡 */}
        <LinearGradient colors={["#FF7EA8", "#FF9F45"]} style={styles.couple}>
          <View style={styles.coupleTop}>
            <Mascot owner="rabbit" size={56} />
            <Text style={styles.heart}>💗</Text>
            <Mascot owner="tiger" size={56} />
          </View>
          <Text style={styles.days}>在一起 {days.toLocaleString("zh-CN")} 天</Text>
          <Text style={styles.account}>共享账本 · 2 人使用中</Text>
        </LinearGradient>

        {/* 共享账本配对 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>共享账本</Text>
          <Text style={styles.hint}>
            和另一半填同一个账本 ID，两台手机即可同步（数据存腾讯云 CloudBase）。
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={ledgerId}
              onChangeText={setLedgerId}
              placeholder="例如 love2026"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              editable={syncStatus !== "synced"}
            />
            {syncStatus === "synced" ? (
              <Pressable style={styles.disconnectBtn} onPress={disconnect}>
                <Text style={styles.disconnectText}>断开</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.connectBtn, syncStatus === "connecting" && styles.connectBtnDisabled]}
                onPress={() => connect()}
                disabled={syncStatus === "connecting"}
              >
                <Text style={styles.connectText}>{syncStatus === "connecting" ? "连接中" : "连接"}</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.statusRow}>
            {syncStatus === "connecting" && <ActivityIndicator size="small" color={theme.rabbitPink} />}
            <Text style={[styles.statusText, syncStatus === "error" && styles.statusError]}>
              {statusText[syncStatus]}
            </Text>
          </View>
        </View>

        {/* 每日提醒 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>每日提醒</Text>
          {TOGGLES.map((tg) => (
            <View key={tg.key} style={styles.row}>
              <Text style={styles.rowText}>
                {tg.label}  {tg.time}
              </Text>
              <Switch
                value={reminders[tg.key]}
                onValueChange={(v) => setReminder(tg.key, v)}
                trackColor={{ false: theme.border, true: theme.mint }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        {/* 管理区 */}
        <View style={styles.manage}>
          {["分类管理", "成员管理", "数据导出"].map((label) => (
            <View key={label} style={styles.manageRow}>
              <Text style={styles.manageText}>{label}</Text>
              <Text style={styles.manageArrow}>›</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bgScreen },
  content: { padding: 20, gap: 18 },
  title: { fontSize: 20, fontWeight: "600", color: theme.textPrimary },
  couple: {
    borderRadius: theme.radiusCard,
    padding: 24,
    gap: 16,
    alignItems: "center",
    shadowColor: "#FF7E6B",
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 28,
    elevation: 6,
  },
  coupleTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  heart: { fontSize: 26 },
  days: { fontSize: 18, fontWeight: "600", color: "#fff", textAlign: "center" },
  account: { fontSize: 13, color: "#fff", opacity: 0.9, textAlign: "center" },
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
  cardTitle: { fontSize: 15, fontWeight: "600", color: theme.textPrimary },
  hint: { fontSize: 12.5, color: theme.textMuted, lineHeight: 18 },
  inputRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  input: {
    flex: 1,
    backgroundColor: theme.bgScreen,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.textPrimary,
  },
  connectBtn: {
    backgroundColor: theme.rabbitPink,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  connectBtnDisabled: { opacity: 0.55 },
  connectText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  disconnectBtn: {
    backgroundColor: theme.bgScreen,
    borderRadius: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: theme.border,
    justifyContent: "center",
  },
  disconnectText: { color: theme.textPrimary, fontSize: 14, fontWeight: "600" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  statusText: { fontSize: 12.5, color: theme.textMuted },
  statusError: { color: theme.tigerOrange },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowText: { fontSize: 14, color: theme.textPrimary },
  manage: {
    backgroundColor: theme.bgCard,
    borderRadius: theme.radiusCard,
    paddingVertical: 6,
    shadowColor: "#6B6B80",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 2,
  },
  manageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 52,
    paddingHorizontal: 16,
  },
  manageText: { fontSize: 14, color: theme.textPrimary },
  manageArrow: { fontSize: 16, color: theme.textMuted, fontWeight: "600" },
});
