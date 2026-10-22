export type Category = '餐飲' | '交通' | '購物' | '其他';
export type Expense = { id: string; title: string; amount: number; category: Category; date: string };
export type MonthlySummary = { month: string; total: number; count: number };
export const STORAGE_KEY = 'gh-apps-lab:expenses:v1';
export const BUDGET_KEY = 'gh-apps-lab:budget:v1';

export function totalForMonth(items: Expense[], month: string): number {
  return items.filter((e) => e.date.startsWith(month)).reduce((sum, e) => sum + e.amount, 0);
}

export function categoryTotals(items: Expense[], month: string): Record<Category, number> {
  const result: Record<Category, number> = { '餐飲': 0, '交通': 0, '購物': 0, '其他': 0 };
  for (const e of items.filter((x) => x.date.startsWith(month))) result[e.category] += e.amount;
  return result;
}

export function filterExpenses(items: Expense[], month: string, category: Category | '全部'): Expense[] {
  return items.filter((item) => item.date.startsWith(month) && (category === '全部' || item.category === category));
}

export function monthlySummaries(items: Expense[]): MonthlySummary[] {
  const summaries = new Map<string, MonthlySummary>();
  for (const item of items) {
    const month = item.date.slice(0, 7);
    const current = summaries.get(month) ?? { month, total: 0, count: 0 };
    current.total += item.amount;
    current.count += 1;
    summaries.set(month, current);
  }
  return [...summaries.values()].sort((a, b) => b.month.localeCompare(a.month));
}

export function validateExpense(title: string, amount: number): string | null {
  if (!title.trim()) return '請填寫項目名稱';
  if (!Number.isFinite(amount) || amount <= 0) return '金額必須大於零';
  return null;
}
