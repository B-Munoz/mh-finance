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

export interface RelocateResult {
  from_category: string;
  to_category: string;
  amount: number;
  from_new_balance: number;
  to_new_balance: number;
}

export interface DirectDepositResult {
  category: string;
  amount: number;
  new_balance: number;
}

export interface UserSettings {
  allocation_pct: Record<string, number>;
  category_limits: Record<string, number>;
}
