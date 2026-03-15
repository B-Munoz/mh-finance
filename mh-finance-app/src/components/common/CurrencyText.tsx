import React from "react";
import { Text, type TextProps } from "react-native";
import { formatCOP } from "../../utils/locale";

interface Props extends TextProps {
  value: number;
}

export function CurrencyText({ value, style, ...rest }: Props) {
  return (
    <Text style={style} {...rest}>
      {formatCOP(value)}
    </Text>
  );
}
