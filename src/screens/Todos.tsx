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

import { useStore } from "../store";
import { theme } from "../theme";
import { todayISO } from "../types";

export default function Todos() {
  const todos = useStore((s) => s.todos);
  const toggleTodo = useStore((s) => s.toggleTodo);
  const addTodo = useStore((s) => s.addTodo);
  const [text, setText] = useState("");

  const t = todayISO();
  const today = todos.filter((x) => x.dueDate === t);
  const done = today.filter((x) => x.done).length;
  const total = today.length;
  const remaining = total - done;

  const add = () => {
    if (!text.trim()) return;
    addTodo(text.trim(), t);
    setText("");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>今日清单</Text>
          <Text style={styles.date}>{t}</Text>
        </View>

        {/* 进度卡片 */}
        <View style={styles.progCard}>
          <View style={styles.ring}>
            <Text style={styles.ringText}>{done}/{total}</Text>
          </View>
          <View style={styles.progText}>
            <Text style={styles.progTitle}>今日还剩 {remaining} 项</Text>
            <Text style={styles.progSub}>17:40 会提醒你总结</Text>
          </View>
        </View>

        {/* 待办列表 */}
        <View style={{ gap: 10 }}>
          {today.map((todo) => (
            <TouchableOpacity
              key={todo.id}
              style={[
                styles.item,
                todo.done ? { backgroundColor: theme.mintSoft } : { backgroundColor: theme.bgCard },
              ]}
              onPress={() => toggleTodo(todo.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.check, todo.done && styles.checkOn]}>
                {todo.done && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.itemText,
                    todo.done && { color: theme.mint, textDecorationLine: "line-through" },
                  ]}
                >
                  {todo.text}
                </Text>
                {todo.carriedOver && <Text style={styles.carryTag}>↳ 顺延而来</Text>}
              </View>
            </TouchableOpacity>
          ))}
          {total === 0 && <Text style={styles.empty}>今天还没有待办，加一条吧～</Text>}
        </View>

        {/* 顺延提示 */}
        <View style={styles.carryBox}>
          <Text style={styles.carryTitle}>⤴ 自动顺延</Text>
          <Text style={styles.carryText}>
            今天没打勾的事项，会在第二天自动进入你的清单，不用重复添加。
          </Text>
        </View>

        {/* 新增输入 */}
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            placeholder="添加一件待办..."
            placeholderTextColor={theme.textMuted}
            value={text}
            onChangeText={setText}
            onSubmitEditing={add}
          />
          <TouchableOpacity style={styles.addBtn} onPress={add}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
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
  date: { fontSize: 13, color: theme.textMuted },
  progCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: theme.bgCard,
    borderRadius: 20,
    padding: 18,
    shadowColor: "#6B6B80",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 2,
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 6,
    borderColor: theme.rabbitPink,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.rabbitPinkSoft,
  },
  ringText: { fontSize: 16, fontWeight: "700", color: theme.textPrimary },
  progText: { flex: 1, gap: 4 },
  progTitle: { fontSize: 16, fontWeight: "600", color: theme.textPrimary },
  progSub: { fontSize: 13, color: theme.textMuted },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    padding: 14,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.rabbitPink,
  },
  checkOn: { backgroundColor: theme.mint, borderColor: theme.mint, alignItems: "center", justifyContent: "center" },
  checkMark: { color: "#fff", fontSize: 14, fontWeight: "800" },
  itemText: { fontSize: 14, color: theme.textPrimary },
  carryTag: { fontSize: 11, color: theme.lemon, marginTop: 2 },
  empty: { fontSize: 13, color: theme.textMuted, textAlign: "center", paddingVertical: 12 },
  carryBox: {
    backgroundColor: theme.lemonSoft,
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
  carryTitle: { fontSize: 14, fontWeight: "600", color: theme.lemon },
  carryText: { fontSize: 13, color: theme.textSecondary, lineHeight: 22 },
  addRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  addInput: {
    flex: 1,
    backgroundColor: theme.bgCard,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 14,
    color: theme.textPrimary,
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: theme.rabbitPink,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: "#fff", fontSize: 26, fontWeight: "700" },
});
