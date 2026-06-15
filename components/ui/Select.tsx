import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  uiSize?: "sm" | "md";
}

const sizeClasses: Record<NonNullable<SelectProps["uiSize"]>, string> = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-2 text-sm",
};

export function Select({ uiSize = "md", className, ...rest }: SelectProps) {
  return (
    <select
      className={cn(
        "border border-surface-border rounded-lg w-full bg-surface-hover text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors",
        sizeClasses[uiSize],
        className,
      )}
      {...rest}
    />
  );
}
