import { AddExpenseForm } from "../forms/AddExpenseForm";
import { IncomeForm } from "../forms/IncomeForm";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: Props) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-72 min-h-screen bg-white border-r p-5 flex flex-col gap-6 shrink-0
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        <div className="flex justify-between items-center">
          <img src="/logo.png.png" alt="MH Finance" className="h-16 w-auto rounded-xl" />
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-gray-600 p-1 text-xl leading-none"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        <hr />
        <AddExpenseForm />
        <hr />
        <IncomeForm />
      </aside>
    </>
  );
}
