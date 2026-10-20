import './style.css';
import { BUDGET_KEY, STORAGE_KEY, categoryTotals, getBudgetUsage, totalForMonth, validateExpense, type Category, type Expense } from './expense';

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
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
<main class="shell">
  <header><div><span class="eyebrow">GH APPS LAB · DEMO</span><h1>日常記帳</h1><p>輕鬆記下每一筆生活開銷。所有資料只儲存在這台裝置的瀏覽器。</p></div><span class="tag">LocalStorage</span></header>
  <section class="summary" aria-label="本月統計">
    <div class="panel total"><span>本月支出</span><strong id="total">$0</strong><small id="month-label"></small></div>
    <div class="panel"><label for="budget">本月預算（NT$）</label><input id="budget" type="number" min="0" step="1" placeholder="例如：12000"/><p id="budget-status">尚未設定預算</p></div>
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
  <section class="panel"><h2>本月分類統計</h2><div id="categories" class="categories"></div></section>
  <section class="panel"><div class="section-head"><h2>支出紀錄</h2><span id="count"></span></div><ul id="expense-list" class="records"></ul></section>
  <footer>開源教學示範 · GitHub Actions + GitHub Pages · <a href="https://github.com/kenming/gh-apps-lab">原始碼</a></footer>
</main>`;
const currency = (v: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(v);
const $ = (id: string) => document.getElementById(id)!;
(document.querySelector<HTMLInputElement>('[name=date]')!).value = `${currentMonth}-${String(today.getDate()).padStart(2, '0')}`;
const budgetInput = $('budget') as HTMLInputElement;
budgetInput.value = budget ? String(budget) : '';
function render() {
  const total = totalForMonth(items, currentMonth);
  $('total').textContent = currency(total);
  $('month-label').textContent = `${yyyy} 年 ${Number(mm)} 月`;
  const usage = getBudgetUsage(total, budget);
  const budgetMessage = usage.status === 'unset' ? '尚未設定預算'
    : usage.status === 'over' ? `超出預算 ${currency(total - budget)}`
    : `剩餘預算 ${currency(budget - total)}`;
  const percentageMessage = usage.percentage === null ? '' : `（使用率 ${Math.round(usage.percentage)}%）`;
  const nearMessage = usage.status === 'near' ? ' · 接近預算上限' : '';
  $('budget-status').textContent = `${budgetMessage}${percentageMessage}${nearMessage}`;
  $('budget-status').className = usage.status === 'over' || usage.status === 'near' ? 'warning' : '';
  const cats = categoryTotals(items, currentMonth);
  $('categories').replaceChildren(...Object.entries(cats).map(([name, amount]) => {
    const row = document.createElement('div');
    const label = document.createElement('span'); label.textContent = name;
    const value = document.createElement('strong'); value.textContent = currency(amount);
    row.append(label, value); return row;
  }));
  const monthly = items.filter((e) => e.date.startsWith(currentMonth)).sort((a,b) => b.date.localeCompare(a.date));
  $('count').textContent = `${monthly.length} 筆`;
  const list = $('expense-list');
  list.replaceChildren();
  if (!monthly.length) { const empty = document.createElement('li'); empty.textContent = '本月還沒有紀錄，從上方新增第一筆。'; empty.className='empty'; list.append(empty); }
  for (const e of monthly) {
    const li = document.createElement('li');
    const info = document.createElement('div'); info.className='record-info';
    const title = document.createElement('strong'); title.textContent = e.title;
    const meta = document.createElement('small'); meta.textContent = `${e.date} · ${e.category}`;
    info.append(title,meta);
    const amount = document.createElement('span'); amount.textContent = currency(e.amount);
    const del = document.createElement('button'); del.textContent = '刪除'; del.className='delete'; del.type='button'; del.setAttribute('aria-label',`刪除 ${e.title}`);
    del.addEventListener('click',()=>{ items=items.filter(x=>x.id!==e.id);save(); });
    li.append(info,amount,del); list.append(li);
  }
}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(items));render();}
budgetInput.addEventListener('change',()=>{const n=Number(budgetInput.value);budget=Number.isFinite(n)&&n>0?Math.floor(n):0;localStorage.setItem(BUDGET_KEY,String(budget));render();});
$('expense-form').addEventListener('submit',(event)=>{
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const fd = new FormData(form);
  const title=String(fd.get('title')??'').trim(), amount=Number(fd.get('amount')), date=String(fd.get('date')??'');
  const error=validateExpense(title,amount);
  if(error){$('message').textContent=error;return;}
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){ $('message').textContent='日期格式錯誤';return; }
  const category=String(fd.get('category')) as Category;
  items.push({id:crypto.randomUUID(),title,amount,category,date});save();
  form.reset(); (document.querySelector<HTMLInputElement>('[name=date]')!).value=`${currentMonth}-${String(today.getDate()).padStart(2,'0')}`;
  $('message').textContent='已新增支出';
});
render();
