"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar, type Tab } from "./Sidebar";
import { BudgetGrid } from "@/components/dashboard/BudgetGrid";
import { ExpensesChart } from "@/components/dashboard/ExpensesChart";
import { IncomeHistory } from "@/components/dashboard/IncomeHistory";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { useExpenses } from "@/hooks/useExpenses";

export function MainLayout() {
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="flex min-h-screen bg-sidebar">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-4 md:p-6 overflow-auto min-w-0">
        <div className="flex items-center gap-3 mb-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-surface border border-surface-border text-gray-300 hover:bg-surface-hover shadow-sm" aria-label="Open sidebar">
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-100 capitalize">{activeTab}</h1>
        </div>
        <h1 className="hidden md:block text-xl font-bold text-gray-100 mb-6 capitalize">{activeTab}</h1>

        {activeTab === "settings" ? (
          <SettingsPage />
        ) : expensesLoading ? (
          <p className="text-sidebar-muted">Loading...</p>
        ) : (
          <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            <section>
              <h2 className="text-sm font-semibold text-sidebar-muted uppercase tracking-wide mb-3">Budgets</h2>
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
