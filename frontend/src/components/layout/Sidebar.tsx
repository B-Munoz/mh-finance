import { AddExpenseForm } from "../forms/AddExpenseForm";
import { IncomeForm } from "../forms/IncomeForm";
import { RelocateForm } from "../forms/RelocateForm";

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
        <div className="relative flex justify-center">
          <img src="/logo.png" alt="MH Finance" className="w-36 h-auto rounded-xl" />
          <button
            onClick={onClose}
            className="md:hidden absolute right-0 top-0 text-gray-400 hover:text-gray-600 p-1 text-xl leading-none"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        <hr />
        <AddExpenseForm />
        <hr />
        <IncomeForm />
        <hr />
        <RelocateForm />
      </aside>
    </>
  );
}
