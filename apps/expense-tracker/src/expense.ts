export type Category = '餐飲' | '交通' | '購物' | '其他';
export type Expense = { id: string; title: string; amount: number; category: Category; date: string };
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
export function validateExpense(title: string, amount: number): string | null {
  if (!title.trim()) return '請填寫項目名稱';
  if (!Number.isFinite(amount) || amount <= 0) return '金額必須大於零';
  return null;
}
