"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { BudgetGrid } from "@/components/dashboard/BudgetGrid";
import { ExpensesChart } from "@/components/dashboard/ExpensesChart";
import { IncomeHistory } from "@/components/dashboard/IncomeHistory";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { useExpenses } from "@/hooks/useExpenses";

type Tab = "dashboard" | "settings";

export function MainLayout() {
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const tabNav = (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
      {(["dashboard", "settings"] as Tab[]).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActiveTab(tab)}
          className={`font-medium px-3 py-1 rounded-md transition-colors capitalize ${
            activeTab === tab ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {activeTab === "dashboard" && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <main className="flex-1 p-4 md:p-6 overflow-auto min-w-0">
        <div className="flex items-center gap-3 mb-4 md:hidden">
          {activeTab === "dashboard" && (
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-white border text-gray-600 hover:bg-gray-50 text-xl leading-none" aria-label="Open sidebar">☰</button>
          )}
          <div className="text-xs">{tabNav}</div>
        </div>
        <div className="hidden md:block mb-6">{tabNav}</div>

        {activeTab === "settings" ? (
          <SettingsPage />
        ) : expensesLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="flex flex-col gap-6 max-w-5xl mx-auto">
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
