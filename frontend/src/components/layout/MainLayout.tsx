import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MetricsRow } from "../dashboard/MetricsRow";
import { BudgetGrid } from "../dashboard/BudgetGrid";
import { ExpensesChart } from "../dashboard/ExpensesChart";
import { TransactionsTable } from "../transactions/TransactionsTable";
import { IncomeHistory } from "../dashboard/IncomeHistory";
import { useExpenses } from "../../hooks/useExpenses";

export function MainLayout() {
  const { data: expenses = [], isLoading } = useExpenses();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 p-4 md:p-6 overflow-auto min-w-0">
        <div className="flex items-center gap-3 mb-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-white border text-gray-600 hover:bg-gray-50 text-xl leading-none"
            aria-label="Open sidebar"
          >
            ☰
          </button>
          <h1 className="text-lg font-bold text-gray-800">MH Finance</h1>
        </div>
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
            <IncomeHistory />
          </div>
        )}
      </main>
    </div>
  );
}
