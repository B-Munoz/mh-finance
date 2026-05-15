"use client";

import { useState, useEffect } from "react";
import { useSettings, useSaveSettings, useAddCategory, useDeleteCategory, useRenameCategory } from "@/hooks/useSettings";

export function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const save = useSaveSettings();
  const addCat = useAddCategory();
  const deleteCat = useDeleteCategory();
  const renameCat = useRenameCategory();

  const [allocPct, setAllocPct] = useState<Record<string, string>>({});
  const [limits, setLimits] = useState<Record<string, string>>({});
  const [renamingCat, setRenamingCat] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null);
  const [catError, setCatError] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;
    const pct: Record<string, string> = {};
    for (const [cat, val] of Object.entries(settings.allocation_pct)) pct[cat] = String(Math.round(val * 100));
    setAllocPct(pct);
    const lim: Record<string, string> = {};
    for (const [cat, val] of Object.entries(settings.category_limits)) lim[cat] = String(val);
    setLimits(lim);
  }, [settings]);

  if (isLoading) return <p className="text-gray-400 p-6">Loading settings...</p>;
  if (!settings) return null;

  const categories = Object.keys(settings.allocation_pct);
  const totalPct = Object.values(allocPct).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const sumOk = totalPct <= 100 + 1e-6;

  function handleSave() {
    const allocation_pct: Record<string, number> = {};
    for (const [cat, v] of Object.entries(allocPct)) allocation_pct[cat] = (parseFloat(v) || 0) / 100;
    const category_limits: Record<string, number> = {};
    for (const [cat, v] of Object.entries(limits)) category_limits[cat] = parseFloat(v) || 0;
    save.mutate({ allocation_pct, category_limits });
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
      <h1 className="text-xl font-bold text-gray-800">Settings</h1>
      {catError && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">{catError}</p>}

      <section className="bg-white rounded-xl border p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-gray-700">Categories</h2>
        <p className="text-xs text-gray-400 -mt-2">Click a name to rename. Delete requires zero balance.</p>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              {renamingCat === cat ? (
                <>
                  <input className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submitRename(cat); if (e.key === "Escape") setRenamingCat(null); }} autoFocus />
                  <button onClick={() => submitRename(cat)} disabled={renameCat.isPending} className="text-green-600 text-sm font-medium hover:text-green-800 disabled:opacity-50">✓</button>
                  <button onClick={() => setRenamingCat(null)} className="text-gray-400 text-sm hover:text-gray-600">✗</button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-gray-700 cursor-pointer hover:text-blue-600" onClick={() => { setRenamingCat(cat); setRenameValue(cat); setCatError(null); }} title="Click to rename">{cat}</span>
                  {confirmDeleteCat === cat ? (
                    <span className="flex items-center gap-1">
                      <button onClick={() => handleDeleteCategory(cat)} disabled={deleteCat.isPending} className="text-red-600 text-xs font-medium hover:text-red-800 disabled:opacity-50">Confirm</button>
                      <button onClick={() => setConfirmDeleteCat(null)} className="text-gray-500 text-xs hover:text-gray-700">Cancel</button>
                    </span>
                  ) : (
                    <button onClick={() => requestDeleteCategory(cat)} className="text-red-400 hover:text-red-600 text-xs px-1" title="Delete category">✕</button>
                  )}
                </>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t">
            <input className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" placeholder="New category name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAddCategory(); }} />
            <button onClick={handleAddCategory} disabled={addCat.isPending || !newCatName.trim()} className="bg-blue-600 text-white rounded px-3 py-1 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {addCat.isPending ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Allocation Percentages</h2>
          <span className={`text-sm font-medium ${sumOk ? "text-green-600" : "text-red-500"}`}>Total: {totalPct.toFixed(0)}% {sumOk ? "✓" : "✗"}</span>
        </div>
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="flex-1 text-sm text-gray-700">{cat}</span>
              <div className="flex items-center gap-1">
                <input type="number" min="0" max="100" step="1" value={allocPct[cat] ?? ""} onChange={(e) => setAllocPct((prev) => ({ ...prev, [cat]: e.target.value }))} className="border rounded px-2 py-1 text-sm w-20 text-right" />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Category Limits</h2>
          <span className="text-xs text-gray-400">0 = no limit</span>
        </div>
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="flex-1 text-sm text-gray-700">{cat}</span>
              <input type="number" min="0" step="1000" value={limits[cat] ?? ""} onChange={(e) => setLimits((prev) => ({ ...prev, [cat]: e.target.value }))} className="border rounded px-2 py-1 text-sm w-28 text-right" />
            </div>
          ))}
        </div>
      </section>

      <button onClick={handleSave} disabled={!sumOk || save.isPending} className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 self-start">
        {save.isPending ? "Saving..." : "Save Settings"}
      </button>
      {save.isSuccess && <p className="text-green-600 text-sm">Settings saved!</p>}
      {save.isError && <p className="text-red-500 text-sm">{(save.error as any)?.response?.data?.detail ?? "Error saving settings"}</p>}
    </div>
  );
}
