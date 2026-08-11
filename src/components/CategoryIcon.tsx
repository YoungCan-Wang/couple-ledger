import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { categoryByKey, type Category } from "../theme";

export default function CategoryIcon({
  categoryKey,
  size = 24,
}: {
  categoryKey: string;
  size?: number;
}) {
  const cat: Category | undefined = categoryByKey(categoryKey);
  const color = cat?.color ?? "#9E9AAC";
  const name = (cat?.icon ?? "help-circle") as any;
  const box = Math.round(size * 1.6);
  return (
    <View
      style={[
        styles.box,
        { width: box, height: box, borderRadius: box * 0.3, backgroundColor: cat?.soft ?? "#F1EAE2" },
      ]}
    >
      <MaterialCommunityIcons name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
  },
});
