"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useCreateExpense } from "@/hooks/useExpenses";
import { formatWithSeparator, parseAmount } from "@/lib/format";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Props {
  category: string;
  onClose: () => void;
}

export function AddExpenseModal({ category, onClose }: Props) {
  const createExpense = useCreateExpense();
  const [displayAmount, setDisplayAmount] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayAmount) return;
    const amount = parseAmount(displayAmount);
    if (!amount) return;
    createExpense.mutate({ category, description, amount }, { onSuccess: () => onClose() });
  }

  return (
    <Modal onClose={onClose} className="w-80">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-sm text-sidebar-muted uppercase tracking-wide">Add Expense</h2>
        <button onClick={onClose} className="text-sidebar-muted hover:text-gray-200 p-1 rounded-lg hover:bg-white/5 transition-colors" aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <p className="text-sm font-medium text-gray-100">{category}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          type="text"
          inputMode="numeric"
          placeholder="Amount"
          value={displayAmount}
          onChange={(e) => setDisplayAmount(formatWithSeparator(e.target.value))}
          autoFocus
          required
        />
        <Input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button type="submit" variant="primary" disabled={createExpense.isPending}>
          {createExpense.isPending ? "Adding..." : "Add Expense"}
        </Button>
      </form>
    </Modal>
  );
}
