import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

import { useStore } from "../store";
import { theme, OWNER, type OwnerKey, CATEGORIES } from "../theme";
import { todayISO } from "../types";
import Mascot from "../components/Mascot";
import CategoryIcon from "../components/CategoryIcon";

const OWNERS: OwnerKey[] = ["rabbit", "tiger", "shared"];

export default function AddEntry() {
  const navigation = useNavigation<any>();
  const addTransaction = useStore((s) => s.addTransaction);

  const [owner, setOwner] = useState<OwnerKey>("rabbit");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");

  const cats = CATEGORIES.filter((c) => c.type === type);

  const save = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    addTransaction({
      owner,
      type,
      category,
      amount: val,
      note: note || undefined,
      date: todayISO(),
    });
    navigation.navigate("Home");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.navCancel}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>记一笔</Text>
        <TouchableOpacity onPress={save}>
          <Text style={[styles.navSave, { color: theme.rabbitPink }]}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 账户选择 */}
        <View style={styles.seg}>
          {OWNERS.map((o) => {
            const sel = owner === o;
            return (
              <TouchableOpacity
                key={o}
                style={[styles.segBtn, sel && { backgroundColor: OWNER[o].soft }]}
                onPress={() => setOwner(o)}
              >
                {o !== "shared" && <Mascot owner={o} size={20} />}
                <Text style={[styles.segText, sel && { color: OWNER[o].color, fontWeight: "700" }]}>
                  {OWNER[o].name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 收支配 */}
        <View style={styles.seg}>
          {(["expense", "income"] as const).map((tp) => {
            const sel = type === tp;
            return (
              <TouchableOpacity
                key={tp}
                style={[styles.segBtn, sel && { backgroundColor: theme.rabbitPinkSoft }]}
                onPress={() => {
                  setType(tp);
                  setCategory(CATEGORIES.find((c) => c.type === tp)?.key || "");
                }}
              >
                <Text style={[styles.segText, sel && { color: theme.rabbitPink, fontWeight: "700" }]}>
                  {tp === "expense" ? "支出" : "收入"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 金额 */}
        <View style={styles.amtBox}>
          <Text style={styles.amtLabel}>金额</Text>
          <View style={styles.amtRow}>
            <Text style={styles.amtSign}>¥</Text>
            <TextInput
              style={styles.amtInput}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.textMuted}
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          <View style={styles.amtLine} />
        </View>

        {/* 分类 */}
        <View style={styles.catGrid}>
          {cats.map((c) => {
            const sel = category === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                style={[styles.cat, sel && { backgroundColor: c.soft, borderColor: c.color }]}
                onPress={() => setCategory(c.key)}
              >
                <CategoryIcon categoryKey={c.key} size={24} />
                <Text style={styles.catText}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 备注 / 日期 */}
        <View style={styles.field}>
          <Text style={styles.fieldIcon}>✏️</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="添加备注..."
            placeholderTextColor={theme.textMuted}
            value={note}
            onChangeText={setNote}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldIcon}>📅</Text>
          <Text style={styles.fieldText}>今天 {todayISO()}</Text>
        </View>

        <TouchableOpacity onPress={save} activeOpacity={0.9}>
          <LinearGradient colors={["#FF8A5C", "#FF6B9E"]} style={styles.saveBtn}>
            <Text style={styles.saveText}>保存</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bgScreen },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 56,
  },
  navCancel: { fontSize: 15, color: theme.textSecondary },
  navTitle: { fontSize: 17, fontWeight: "600", color: theme.textPrimary },
  navSave: { fontSize: 15, fontWeight: "600" },
  content: { padding: 20, gap: 20 },
  seg: {
    flexDirection: "row",
    backgroundColor: theme.bgCard,
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  segBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  segText: { fontSize: 14, color: theme.textSecondary },
  amtBox: { gap: 8 },
  amtLabel: { fontSize: 13, color: theme.textMuted },
  amtRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  amtSign: { fontSize: 28, fontWeight: "700", color: theme.textPrimary },
  amtInput: { flex: 1, fontSize: 48, fontWeight: "800", color: theme.textPrimary },
  amtLine: { height: 2, backgroundColor: theme.border },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  cat: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: theme.bgCard,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },
  catText: { fontSize: 12, color: theme.textPrimary },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.bgCard,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  fieldIcon: { fontSize: 16 },
  fieldInput: { flex: 1, fontSize: 14, color: theme.textPrimary },
  fieldText: { flex: 1, fontSize: 14, color: theme.textPrimary },
  saveBtn: {
    height: 56,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF7E6B",
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 5,
  },
  saveText: { fontSize: 17, fontWeight: "600", color: "#fff" },
});
