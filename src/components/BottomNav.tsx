import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../theme";

const TABS = [
  { name: "Home", label: "首页", icon: "home-variant", active: theme.rabbitPink },
  { name: "Ledger", label: "账本", icon: "book-outline", active: theme.rabbitPink },
  { name: "Add", label: "", icon: "plus", active: "#fff" },
  { name: "Todos", label: "清单", icon: "format-list-checkbox", active: theme.rabbitPink },
  { name: "Us", label: "我们", icon: "account-group", active: theme.rabbitPink },
] as const;

export default function BottomNav({ state, navigation }: any) {
  return (
    <View style={styles.wrap}>
      <View style={styles.pill}>
        {TABS.map((tab, i) => {
          const isFocused = state.index === i;
          if (tab.name === "Add") {
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.addWrap}
                onPress={() => navigation.navigate("Add")}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#FF9F45", "#FF7EA8"]}
                  style={styles.addBtn}
                >
                  <MaterialCommunityIcons name="plus" size={26} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => navigation.navigate(tab.name)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={20}
                color={isFocused ? tab.active : theme.textMuted}
              />
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? tab.active : theme.textMuted },
                  isFocused && styles.labelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: 18,
    paddingTop: 6,
    backgroundColor: "transparent",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.bgCard,
    borderRadius: 36,
    paddingVertical: 10,
    paddingHorizontal: 14,
    width: "92%",
    justifyContent: "space-between",
    shadowColor: "#6B6B80",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  label: {
    fontSize: 10,
  },
  labelActive: {
    fontFamily: "System",
    fontWeight: "600",
  },
  addWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF7E6B",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
  },
});
