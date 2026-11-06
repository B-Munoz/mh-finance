"use client";

import { useState, useEffect } from "react";
import { Check, X, Trash2, Plus } from "lucide-react";
import { useSettings, useSaveSettings, useAddCategory, useDeleteCategory, useRenameCategory } from "@/hooks/useSettings";
import { formatCurrency, formatWithSeparator, parseAmount, calcAllocationAmount } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const save = useSaveSettings();
  const addCat = useAddCategory();
  const deleteCat = useDeleteCategory();
  const renameCat = useRenameCategory();

  const [allocPct, setAllocPct] = useState<Record<string, string>>({});
  const [allocAmounts, setAllocAmounts] = useState<Record<string, string>>({});
  const [allocationMode, setAllocationMode] = useState<"percentage" | "amount">("percentage");
  const [allocationTotal, setAllocationTotal] = useState("");
  const [limits, setLimits] = useState<Record<string, string>>({});
  const [renamingCat, setRenamingCat] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null);
  const [catError, setCatError] = useState<string | null>(null);
  const [sampleIncomeDisplay, setSampleIncomeDisplay] = useState("");

  useEffect(() => {
    if (!settings) return;
    const pct: Record<string, string> = {};
    for (const [cat, val] of Object.entries(settings.allocation_pct)) pct[cat] = String(Math.round(val * 100));
    setAllocPct(pct);
    const amounts: Record<string, string> = {};
    for (const [cat, val] of Object.entries(settings.allocation_amounts)) amounts[cat] = formatWithSeparator(String(val));
    setAllocAmounts(amounts);
    setAllocationMode(settings.allocation_mode);
    setAllocationTotal(formatWithSeparator(String(settings.allocation_total)));
    const lim: Record<string, string> = {};
    for (const [cat, val] of Object.entries(settings.category_limits)) lim[cat] = String(val);
    setLimits(lim);
  }, [settings]);

  if (isLoading) return <p className="text-sidebar-muted p-6">Loading settings...</p>;
  if (!settings) return null;

  const categories = Object.keys(settings.allocation_pct);
  const totalPct = Object.values(allocPct).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const totalAmount = allocationTotal ? parseAmount(allocationTotal) : 0;
  const assignedAmount = Object.values(allocAmounts).reduce((sum, v) => sum + (v ? parseAmount(v) : 0), 0);
  const sumOk = allocationMode === "percentage"
    ? totalPct <= 100 + 1e-6
    : totalAmount > 0 && Math.abs(assignedAmount - totalAmount) <= 0.01;
  const sampleIncome = sampleIncomeDisplay ? parseAmount(sampleIncomeDisplay) : 0;

  function handleSave() {
    const allocation_pct: Record<string, number> = {};
    for (const [cat, v] of Object.entries(allocPct)) allocation_pct[cat] = (parseFloat(v) || 0) / 100;
    const allocation_amounts: Record<string, number> = {};
    for (const [cat, v] of Object.entries(allocAmounts)) allocation_amounts[cat] = v ? parseAmount(v) : 0;
    const category_limits: Record<string, number> = {};
    for (const [cat, v] of Object.entries(limits)) category_limits[cat] = parseFloat(v) || 0;
    save.mutate({
      allocation_pct,
      category_limits,
      allocation_mode: allocationMode,
      allocation_total: totalAmount,
      allocation_amounts,
    });
  }

  function submitRename(cat: string) {
    const newName = renameValue.trim();
    if (!newName || newName === cat) { setRenamingCat(null); return; }
    renameCat.mutate({ oldName: cat, newName }, {
      onSuccess: () => { setRenamingCat(null); setCatError(null); },
      onError: (e: any) => setCatError(e?.response?.data?.detail ?? "Error renaming category"),
    });
  }

  function handleAddCategory() {
    const name = newCatName.trim();
    if (!name) return;
    addCat.mutate(name, {
      onSuccess: () => { setNewCatName(""); setCatError(null); },
      onError: (e: any) => setCatError(e?.response?.data?.detail ?? "Error adding category"),
    });
  }

  function handleDeleteCategory(cat: string) {
    deleteCat.mutate(cat, {
      onSuccess: () => { setConfirmDeleteCat(null); setCatError(null); },
      onError: (e: any) => setCatError(e?.response?.data?.detail ?? "Error deleting category"),
    });
  }

  function requestDeleteCategory(cat: string) {
    setConfirmDeleteCat(cat);
    setCatError(null);
    setTimeout(() => setConfirmDeleteCat((c) => (c === cat ? null : c)), 5000);
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto p-4 md:p-6">
      {catError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{catError}</p>}

      <Card className="flex flex-col gap-4">
        <h2 className="font-semibold text-gray-100">Categories</h2>
        <p className="text-xs text-sidebar-muted -mt-2">Click a name to rename. Delete requires zero balance.</p>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              {renamingCat === cat ? (
                <>
                  <Input className="flex-1" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submitRename(cat); if (e.key === "Escape") setRenamingCat(null); }} autoFocus />
                  <button onClick={() => submitRename(cat)} disabled={renameCat.isPending} className="text-green-400 hover:text-green-300 disabled:opacity-50 p-1 rounded-lg hover:bg-green-500/10 transition-colors"><Check size={16} /></button>
                  <button onClick={() => setRenamingCat(null)} className="text-sidebar-muted hover:text-gray-200 p-1 rounded-lg hover:bg-white/5 transition-colors"><X size={16} /></button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-gray-100 cursor-pointer hover:text-accent-500" onClick={() => { setRenamingCat(cat); setRenameValue(cat); setCatError(null); }} title="Click to rename">{cat}</span>
                  {confirmDeleteCat === cat ? (
                    <span className="flex items-center gap-1">
                      <button onClick={() => handleDeleteCategory(cat)} disabled={deleteCat.isPending} className="text-red-400 text-xs font-medium hover:text-red-300 disabled:opacity-50">Confirm</button>
                      <button onClick={() => setConfirmDeleteCat(null)} className="text-sidebar-muted text-xs hover:text-gray-200">Cancel</button>
                    </span>
                  ) : (
                    <button onClick={() => requestDeleteCategory(cat)} className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete category"><Trash2 size={14} /></button>
                  )}
                </>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-surface-border">
            <Input className="flex-1" placeholder="New category name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAddCategory(); }} />
            <Button onClick={handleAddCategory} disabled={addCat.isPending || !newCatName.trim()} size="sm">
              <Plus size={14} />
              {addCat.isPending ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-100">Income Allocation</h2>
          <span className={cn("text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1", sumOk ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
            {allocationMode === "percentage"
              ? <>Total: {totalPct.toFixed(0)}%</>
              : <>Assigned: {formatCurrency(assignedAmount)} / {formatCurrency(totalAmount)}</>}
            {sumOk ? <Check size={14} /> : <X size={14} />}
          </span>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          <button type="button" onClick={() => setAllocationMode("percentage")} className={cn("flex-1 text-xs font-medium py-1.5 rounded-md transition-colors", allocationMode === "percentage" ? "bg-accent-600 text-white" : "text-sidebar-muted hover:text-gray-100")}>Percentages</button>
          <button type="button" onClick={() => setAllocationMode("amount")} className={cn("flex-1 text-xs font-medium py-1.5 rounded-md transition-colors", allocationMode === "amount" ? "bg-accent-600 text-white" : "text-sidebar-muted hover:text-gray-100")}>Amounts</button>
        </div>
        <p className="text-xs text-sidebar-muted -mt-2">
          {allocationMode === "percentage"
            ? "Choose each category's share of income. Shares may total up to 100%."
            : "Set a total and split it across categories. Each income is distributed using the same proportions."}
        </p>
        <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
          <label className="text-sm text-gray-300 font-medium whitespace-nowrap">Sample income</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={sampleIncomeDisplay}
            onChange={(e) => setSampleIncomeDisplay(formatWithSeparator(e.target.value))}
            className="bg-surface-hover border border-surface-border text-gray-100 rounded-lg px-3 py-1.5 text-sm w-full text-right focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
          />
        </div>
        {allocationMode === "amount" && (
          <div className="flex items-center gap-3">
            <label className="flex-1 text-sm text-gray-100">Total allocation amount (COP)</label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={allocationTotal}
              onChange={(e) => setAllocationTotal(formatWithSeparator(e.target.value))}
              className="w-36 text-right"
            />
          </div>
        )}
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="flex-1 text-sm text-gray-100">{cat}</span>
              {sampleIncome > 0 && allocationMode === "percentage" && (
                <span className="text-xs text-sidebar-muted tabular-nums w-28 text-right">
                  {formatCurrency(calcAllocationAmount(parseFloat(allocPct[cat]) || 0, sampleIncome))}
                </span>
              )}
              {sampleIncome > 0 && allocationMode === "amount" && totalAmount > 0 && (
                <span className="text-xs text-sidebar-muted tabular-nums w-28 text-right">
                  {formatCurrency(((allocAmounts[cat] ? parseAmount(allocAmounts[cat]) : 0) / totalAmount) * sampleIncome)}
                </span>
              )}
              {allocationMode === "percentage" ? (
                <div className="flex items-center gap-1">
                  <Input type="number" min="0" max="100" step="1" value={allocPct[cat] ?? ""} onChange={(e) => setAllocPct((prev) => ({ ...prev, [cat]: e.target.value }))} className="w-20 text-right" />
                  <span className="text-sm text-sidebar-muted">%</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={allocAmounts[cat] ?? ""}
                    onChange={(e) => setAllocAmounts((prev) => ({ ...prev, [cat]: formatWithSeparator(e.target.value) }))}
                    className="w-36 text-right"
                  />
                  <span className="text-xs text-sidebar-muted">COP</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-100">Category Limits</h2>
          <span className="text-xs text-sidebar-muted">0 = no limit</span>
        </div>
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="flex-1 text-sm text-gray-100">{cat}</span>
              <Input type="number" min="0" step="1000" value={limits[cat] ?? ""} onChange={(e) => setLimits((prev) => ({ ...prev, [cat]: e.target.value }))} className="w-28 text-right" />
            </div>
          ))}
        </div>
      </Card>

      <Button onClick={handleSave} disabled={!sumOk || save.isPending} className="self-start">
        {save.isPending ? "Saving..." : "Save Settings"}
      </Button>
      {save.isSuccess && <p className="text-green-400 text-sm">Settings saved!</p>}
      {save.isError && <p className="text-red-400 text-sm">{(save.error as any)?.response?.data?.detail ?? "Error saving settings"}</p>}
    </div>
  );
}
