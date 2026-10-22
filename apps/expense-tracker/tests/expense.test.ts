import { describe, expect, it } from 'vitest';
import { categoryTotals, monthlySummaries, totalForMonth, validateExpense, type Expense } from '../src/expense';

const data: Expense[] = [
  { id: '1', title: '早餐', amount: 80, category: '餐飲', date: '2026-10-01' },
  { id: '2', title: '捷運', amount: 30, category: '交通', date: '2026-10-01' },
  { id: '3', title: '晚餐', amount: 150, category: '餐飲', date: '2026-09-30' },
];

describe('expense calculations', () => {
  it('sums only the requested month', () => expect(totalForMonth(data, '2026-10')).toBe(110));
  it('groups by category', () => expect(categoryTotals(data, '2026-10')).toEqual({ '餐飲': 80, '交通': 30, '購物': 0, '其他': 0 }));
  it('summarizes all months newest first', () => expect(monthlySummaries(data)).toEqual([
    { month: '2026-10', total: 110, count: 2 },
    { month: '2026-09', total: 150, count: 1 },
  ]));
  it('rejects invalid inputs', () => {
    expect(validateExpense('', 5)).not.toBeNull();
    expect(validateExpense('午餐', 0)).not.toBeNull();
    expect(validateExpense('午餐', 85)).toBeNull();
  });
});
