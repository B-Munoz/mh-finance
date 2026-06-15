import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md";
}

const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
};

export function Card({ padding = "md", className, ...rest }: CardProps) {
  return (
    <div
      className={cn("bg-surface rounded-xl shadow-sm border border-surface-border", paddingClasses[padding], className)}
      {...rest}
    />
  );
}
