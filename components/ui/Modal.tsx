import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ onClose, children, className }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={cn("bg-surface border border-surface-border rounded-2xl shadow-xl p-6 flex flex-col gap-4", className)} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
