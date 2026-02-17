export interface Company {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  project_id: string | null;
  category_id: string;
  company_id: string;
  installment_group_id: string | null;
  installment_number: number | null;
  total_installments: number | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  project?: Project;
  category?: Category;
}

export interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  totalProfit: number;
  profitByProject: ProjectProfit[];
  monthlyData: MonthlyData[];
  expenseByCategory: CategoryDistribution[];
  forecast: ForecastData[];
}

export interface ProjectProfit {
  projectId: string;
  projectName: string;
  income: number;
  expense: number;
  profit: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  profit: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  percentage: number;
}

export interface ForecastData {
  month: string;
  income: number;
  expense: number;
}

// Form types
export interface ProjectFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

export interface CategoryFormData {
  name: string;
  type: TransactionType;
}

export interface TransactionFormData {
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  project_id: string;
  category_id: string;
  installments?: number;
}
