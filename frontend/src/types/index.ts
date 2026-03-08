export interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface Budget {
  category: string;
  current_balance: number;
  limit: number;
}

export interface UserConfig {
  categories: string[];
  limits: Record<string, number>;
  allocation_pct: Record<string, number>;
}

export interface AllocationResult {
  allocations: Record<string, number>;
}

export interface IncomeRecord {
  id: number;
  date: string;
  amount: number;
  allocations: Record<string, number>;
}
