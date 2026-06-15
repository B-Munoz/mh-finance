import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...rest }: InputProps) {
  return (
    <input
      className={cn(
        "bg-surface-hover border border-surface-border rounded-lg px-3 py-2 text-sm w-full text-gray-100 placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors",
        className,
      )}
      {...rest}
    />
  );
}
