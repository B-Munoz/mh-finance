import { AddExpenseForm } from "../forms/AddExpenseForm";
import { IncomeForm } from "../forms/IncomeForm";

export function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-white border-r p-5 flex flex-col gap-6 shrink-0">
      <div>
        <h1 className="text-lg font-bold text-gray-800">MH Finance</h1>
        <p className="text-xs text-gray-400 mt-0.5">Personal Finance Manager</p>
      </div>
      <hr />
      <AddExpenseForm />
      <hr />
      <IncomeForm />
    </aside>
  );
}
