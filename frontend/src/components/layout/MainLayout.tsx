import { Sidebar } from "./Sidebar";
import { MetricsRow } from "../dashboard/MetricsRow";
import { BudgetGrid } from "../dashboard/BudgetGrid";
import { ExpensesChart } from "../dashboard/ExpensesChart";
import { TransactionsTable } from "../transactions/TransactionsTable";
import { useExpenses } from "../../hooks/useExpenses";

export function MainLayout() {
  const { data: expenses = [], isLoading } = useExpenses();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        {isLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            <MetricsRow expenses={expenses} />
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Budgets</h2>
              <BudgetGrid />
            </section>
            <ExpensesChart expenses={expenses} />
            <TransactionsTable expenses={expenses} />
          </div>
        )}
      </main>
    </div>
  );
}
