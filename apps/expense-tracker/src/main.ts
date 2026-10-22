import './style.css';
import { BUDGET_KEY, STORAGE_KEY, categoryTotals, filterExpenses, monthlySummaries, totalForMonth, validateExpense, type Category, type Expense } from './expense';

function readExpenses(): Expense[] {
  try { const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); return Array.isArray(raw) ? raw.filter(isExpense) : []; }
  catch { return []; }
}
function isExpense(x: unknown): x is Expense {
  if (!x || typeof x !== 'object') return false;
  const e = x as Record<string, unknown>;
  return typeof e.id === 'string' && typeof e.title === 'string' && typeof e.amount === 'number'
    && e.amount > 0 && Number.isFinite(e.amount) && typeof e.date === 'string'
    && ['餐飲', '交通', '購物', '其他'].includes(String(e.category));
}

let items = readExpenses();
let budget = Number(localStorage.getItem(BUDGET_KEY) ?? 0);
if (!Number.isFinite(budget) || budget < 0) budget = 0;

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const currentMonth = `${yyyy}-${mm}`;
let selectedMonth = currentMonth;
let selectedCategory: Category | '全部' = '全部';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
<main class="shell">
  <header><div><span class="eyebrow">GH APPS LAB · DEMO</span><h1>日常記帳</h1><p>輕鬆記下每一筆生活開銷。所有資料只儲存在這台裝置的瀏覽器。</p></div><span class="tag">LocalStorage</span></header>

  <section class="month-toolbar panel" aria-label="月份篩選">
    <label for="month-picker">查看月份</label>
    <input id="month-picker" type="month" />
    <button id="current-month" type="button" class="secondary">回到本月</button>
  </section>

  <section class="summary" aria-label="月份統計">
    <div class="panel total"><span>當月支出</span><strong id="total">$0</strong><small id="month-label"></small></div>
    <div class="panel"><label for="budget">每月預算（NT$）</label><input id="budget" type="number" min="0" step="1" placeholder="例如：12000"/><p id="budget-status">尚未設定預算</p></div>
  </section>

  <section class="panel"><h2>新增支出</h2>
    <form id="expense-form" class="form">
      <label>項目<input name="title" required maxlength="60" placeholder="例如：午餐"/></label>
      <label>金額<input name="amount" type="number" min="1" step="1" required placeholder="100"/></label>
      <label>類別<select name="category"><option>餐飲</option><option>交通</option><option>購物</option><option>其他</option></select></label>
      <label>日期<input name="date" type="date" required/></label>
      <button type="submit">新增紀錄</button>
    </form><p id="message" role="status"></p>
  </section>

  <section class="panel"><h2>分類統計</h2><div id="categories" class="categories"></div></section>

  <section class="panel"><div class="section-head"><h2>支出紀錄</h2><span id="count"></span></div><div class="month-toolbar"><label for="category-filter">類別篩選</label><select id="category-filter"><option>全部</option><option>餐飲</option><option>交通</option><option>購物</option><option>其他</option></select></div><ul id="expense-list" class="records"></ul></section>

  <section class="panel"><div class="section-head"><h2>各月份支出彙整</h2><span id="month-count"></span></div><div id="monthly-summary" class="monthly-summary"></div></section>

  <footer>開源教學示範 · GitHub Actions + GitHub Pages · <a href="https://github.com/kenming/gh-apps-lab">原始碼</a></footer>
</main>`;

const currency = (v: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(v);
const $ = (id: string) => document.getElementById(id)!;
const monthLabel = (month: string) => {
  const [year, monthNumber] = month.split('-');
  return `${year} 年 ${Number(monthNumber)} 月`;
};

const dateInput = document.querySelector<HTMLInputElement>('[name=date]')!;
dateInput.value = `${currentMonth}-${String(today.getDate()).padStart(2, '0')}`;

const monthPicker = $('month-picker') as HTMLInputElement;
monthPicker.value = selectedMonth;

const categoryFilter = $('category-filter') as HTMLSelectElement;
categoryFilter.value = selectedCategory;

const budgetInput = $('budget') as HTMLInputElement;
budgetInput.value = budget ? String(budget) : '';

function render() {
  const total = totalForMonth(items, selectedMonth);
  $('total').textContent = currency(total);
  $('month-label').textContent = monthLabel(selectedMonth);
  $('budget-status').textContent = budget <= 0 ? '尚未設定預算' : total > budget ? `超出預算 ${currency(total - budget)}` : `剩餘預算 ${currency(budget - total)}`;
  $('budget-status').className = budget > 0 && total > budget ? 'warning' : '';

  const cats = categoryTotals(items, selectedMonth);
  $('categories').replaceChildren(...Object.entries(cats).map(([name, amount]) => {
    const row = document.createElement('div');
    const label = document.createElement('span'); label.textContent = name;
    const value = document.createElement('strong'); value.textContent = currency(amount);
    row.append(label, value);
    return row;
  }));

  const monthly = filterExpenses(items, selectedMonth, selectedCategory).sort((a, b) => b.date.localeCompare(a.date));
  $('count').textContent = `${monthly.length} 筆`;
  const list = $('expense-list');
  list.replaceChildren();
  if (!monthly.length) {
    const empty = document.createElement('li');
    empty.textContent = selectedCategory === '全部' ? `${monthLabel(selectedMonth)}還沒有紀錄。` : `${monthLabel(selectedMonth)}沒有「${selectedCategory}」類別的紀錄。`;
    empty.className = 'empty';
    list.append(empty);
  }
  for (const e of monthly) {
    const li = document.createElement('li');
    const info = document.createElement('div'); info.className = 'record-info';
    const title = document.createElement('strong'); title.textContent = e.title;
    const meta = document.createElement('small'); meta.textContent = `${e.date} · ${e.category}`;
    info.append(title, meta);
    const amount = document.createElement('span'); amount.textContent = currency(e.amount);
    const del = document.createElement('button'); del.textContent = '刪除'; del.className = 'delete'; del.type = 'button'; del.setAttribute('aria-label', `刪除 ${e.title}`);
    del.addEventListener('click', () => { items = items.filter((x) => x.id !== e.id); save(); });
    li.append(info, amount, del);
    list.append(li);
  }

  const summaries = monthlySummaries(items);
  $('month-count').textContent = `${summaries.length} 個月份`;
  const summary = $('monthly-summary');
  summary.replaceChildren();
  if (!summaries.length) {
    const empty = document.createElement('p');
    empty.textContent = '尚無可彙整的支出紀錄。';
    empty.className = 'empty';
    summary.append(empty);
  }
  for (const item of summaries) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = item.month === selectedMonth ? 'month-row active' : 'month-row';
    button.setAttribute('aria-label', `查看 ${monthLabel(item.month)}支出`);
    const label = document.createElement('span');
    label.innerHTML = `<strong>${monthLabel(item.month)}</strong><small>${item.count} 筆</small>`;
    const amount = document.createElement('strong');
    amount.textContent = currency(item.total);
    button.append(label, amount);
    button.addEventListener('click', () => {
      selectedMonth = item.month;
      monthPicker.value = selectedMonth;
      render();
    });
    summary.append(button);
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  render();
}

categoryFilter.addEventListener('change', () => {
  selectedCategory = categoryFilter.value as Category | '全部';
  render();
});

monthPicker.addEventListener('change', () => {
  if (!/^\d{4}-\d{2}$/.test(monthPicker.value)) return;
  selectedMonth = monthPicker.value;
  render();
});

$('current-month').addEventListener('click', () => {
  selectedMonth = currentMonth;
  monthPicker.value = currentMonth;
  render();
});

budgetInput.addEventListener('change', () => {
  const n = Number(budgetInput.value);
  budget = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  localStorage.setItem(BUDGET_KEY, String(budget));
  render();
});

$('expense-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const fd = new FormData(form);
  const title = String(fd.get('title') ?? '').trim();
  const amount = Number(fd.get('amount'));
  const date = String(fd.get('date') ?? '');
  const error = validateExpense(title, amount);

  if (error) { $('message').textContent = error; return; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { $('message').textContent = '日期格式錯誤'; return; }

  const category = String(fd.get('category')) as Category;
  items.push({ id: crypto.randomUUID(), title, amount, category, date });
  selectedMonth = date.slice(0, 7);
  monthPicker.value = selectedMonth;
  save();

  form.reset();
  dateInput.value = `${currentMonth}-${String(today.getDate()).padStart(2, '0')}`;
  $('message').textContent = '已新增支出';
});

render();
