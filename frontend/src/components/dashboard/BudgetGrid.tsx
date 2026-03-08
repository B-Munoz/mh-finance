import { useBudgets } from "../../hooks/useBudgets";
import { BudgetCard } from "./BudgetCard";

export function BudgetGrid() {
  const { data: budgets, isLoading } = useBudgets();

  if (isLoading) return <p className="text-gray-400 text-sm">Loading budgets...</p>;
  if (!budgets?.length) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {budgets.map((b) => (
        <BudgetCard key={b.category} budget={b} />
      ))}
    </div>
  );
}
