import { describe, expect, it } from 'vitest';
import { categoryTotals, getBudgetUsage, totalForMonth, validateExpense, type Expense } from '../src/expense';
const data: Expense[] = [
  { id: '1', title: '早餐', amount: 80, category: '餐飲', date: '2026-10-01' },
  { id: '2', title: '捷運', amount: 30, category: '交通', date: '2026-10-01' },
  { id: '3', title: '晚餐', amount: 150, category: '餐飲', date: '2026-09-30' },
];
describe('expense calculations', () => {
  it('sums only the requested month', () => expect(totalForMonth(data, '2026-10')).toBe(110));
  it('groups by category', () => expect(categoryTotals(data, '2026-10')).toEqual({ '餐飲': 80, '交通': 30, '購物': 0, '其他': 0 }));
  it('rejects invalid inputs', () => { expect(validateExpense('', 5)).not.toBeNull(); expect(validateExpense('午餐', 0)).not.toBeNull(); expect(validateExpense('午餐', 85)).toBeNull(); });
});

describe('budget usage boundaries', () => {
  it('does not show a percentage without a budget', () => expect(getBudgetUsage(100, 0)).toEqual({ percentage: null, status: 'unset' }));
  it('does not warn at 79%', () => expect(getBudgetUsage(79, 100)).toEqual({ percentage: 79, status: 'normal' }));
  it('warns at 80%', () => expect(getBudgetUsage(80, 100)).toEqual({ percentage: 80, status: 'near' }));
  it('warns at 100%', () => expect(getBudgetUsage(100, 100)).toEqual({ percentage: 100, status: 'near' }));
  it('preserves over-budget status at 110%', () => { const usage = getBudgetUsage(110, 100); expect(usage.status).toBe('over'); expect(usage.percentage).toBeCloseTo(110); });
});
