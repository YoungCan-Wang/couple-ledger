import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { OWNER, type OwnerKey } from "../theme";

export default function Mascot({
  owner,
  size = 40,
}: {
  owner: OwnerKey;
  size?: number;
}) {
  const o = OWNER[owner];
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: o.soft,
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.55 }}>{o.emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
  },
});
