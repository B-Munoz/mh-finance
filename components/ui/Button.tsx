import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "income" | "relocate";
  size?: "sm" | "md";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-accent-600 text-white hover:bg-accent-700 disabled:opacity-50",
  secondary: "border border-surface-border text-gray-200 hover:bg-surface-hover disabled:opacity-50",
  danger: "text-red-400 hover:text-red-300 disabled:opacity-50",
  ghost: "text-sidebar-muted hover:text-gray-200 disabled:opacity-50",
  income: "bg-green-600 text-white hover:bg-green-700 disabled:opacity-50",
  relocate: "bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
};

export function Button({ variant = "primary", size = "md", className, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    />
  );
}
