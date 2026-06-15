"use client";

import { LayoutDashboard, Settings, LogOut, X } from "lucide-react";
import { IncomeForm } from "@/components/forms/IncomeForm";
import { RelocateForm } from "@/components/forms/RelocateForm";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/cn";

export type Tab = "dashboard" | "settings";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left",
        active ? "bg-accent-600 text-white" : "text-sidebar-muted hover:bg-sidebar-hover hover:text-white",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export function Sidebar({ isOpen, onClose, activeTab, onTabChange }: Props) {
  const { username, logout } = useAuth();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={onClose} />}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-72 min-h-screen bg-sidebar text-white flex flex-col shrink-0
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        <div className="relative flex items-center justify-center p-5">
          <img src="/logo.png" alt="MH Finance" className="w-32 h-auto rounded-lg" />
          <button onClick={onClose} className="md:hidden absolute right-5 top-5 text-sidebar-muted hover:text-white" aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <nav className="px-3 flex flex-col gap-1">
          <NavButton active={activeTab === "dashboard"} onClick={() => onTabChange("dashboard")} icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavButton active={activeTab === "settings"} onClick={() => onTabChange("settings")} icon={<Settings size={18} />} label="Settings" />
        </nav>

        <div className="border-t border-sidebar-border mx-5 my-4" />

        {activeTab === "dashboard" ? (
          <div className="flex-1 overflow-y-auto scrollbar-thin px-5 flex flex-col gap-6 pb-4">
            <IncomeForm />
            <div className="border-t border-sidebar-border" />
            <RelocateForm />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <div className="border-t border-sidebar-border p-4 flex items-center justify-between gap-2">
          <span className="text-sm text-sidebar-muted truncate">{username}</span>
          <button onClick={logout} className="text-sidebar-muted hover:text-white p-2 rounded-lg hover:bg-sidebar-hover transition-colors" aria-label="Log out" title="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
