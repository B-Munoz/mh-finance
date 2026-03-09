import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MetricsRow } from "../dashboard/MetricsRow";
import { BudgetGrid } from "../dashboard/BudgetGrid";
import { ExpensesChart } from "../dashboard/ExpensesChart";
import { TransactionsTable } from "../transactions/TransactionsTable";
import { IncomeHistory } from "../dashboard/IncomeHistory";
import { SettingsPage } from "../settings/SettingsPage";
import { useExpenses } from "../../hooks/useExpenses";

type Tab = "dashboard" | "settings";

export function MainLayout() {
  const { data: expenses = [], isLoading } = useExpenses();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {activeTab === "dashboard" && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      <main className="flex-1 p-4 md:p-6 overflow-auto min-w-0">
        <div className="flex items-center gap-3 mb-4 md:hidden">
          {activeTab === "dashboard" && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-white border text-gray-600 hover:bg-gray-50 text-xl leading-none"
              aria-label="Open sidebar"
            >
              ☰
            </button>
          )}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className={`text-xs font-medium px-3 py-1 rounded-md transition-colors ${
                activeTab === "dashboard" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`text-xs font-medium px-3 py-1 rounded-md transition-colors ${
                activeTab === "settings" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Desktop tab nav */}
        <div className="hidden md:flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`text-sm font-medium px-4 py-1.5 rounded-md transition-colors ${
              activeTab === "dashboard" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`text-sm font-medium px-4 py-1.5 rounded-md transition-colors ${
              activeTab === "settings" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Settings
          </button>
        </div>

        {activeTab === "settings" ? (
          <SettingsPage />
        ) : isLoading ? (
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
