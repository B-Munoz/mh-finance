import React from "react";
import { View, StyleSheet } from "react-native";
import { getBarColor } from "../../utils/colors";
import { Colors } from "../../utils/colors";

interface Props {
  progress: number; // 0–1
  hasLimit: boolean;
}

export function ProgressBar({ progress, hasLimit }: Props) {
  const pct = Math.round(Math.min(Math.max(progress, 0), 1) * 100);
  const color = hasLimit ? getBarColor(pct) : Colors.blue400;
  const width = hasLimit ? `${pct}%` : "100%";

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: width as any, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    backgroundColor: Colors.gray100,
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
});
