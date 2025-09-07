// Finance Dashboard - Vanilla JS + localStorage + Chart.js
const $ = (sel)=>document.querySelector(sel);
const STORAGE_KEY = "finance_tx_v1";

let state = { tx: JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") };

const form = $("#txForm");
const tbody = document.querySelector("#txTable tbody");
const sumIncomeEl = $("#sumIncome");
const sumExpenseEl = $("#sumExpense");
const sumNetEl = $("#sumNet");

const categoryCtx = document.getElementById('categoryChart').getContext('2d');
let categoryChart;

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tx)); }
function currency(n){ return (+n).toFixed(2); }

function totals(){
  const income = state.tx.filter(t=>t.type==='income').reduce((a,b)=>a+Number(b.amount),0);
  const expense = state.tx.filter(t=>t.type==='expense').reduce((a,b)=>a+Number(b.amount),0);
  return {income, expense, net: income - expense};
}

function byCategory(){
  const map = {};
  for(const t of state.tx){
    const sign = t.type === 'expense' ? -1 : 1;
    map[t.category] = (map[t.category]||0) + sign * Number(t.amount);
  }
  return { labels: Object.keys(map), values: Object.values(map) };
}

function renderTable(){
  tbody.innerHTML = state.tx
    .sort((a,b)=>new Date(b.date)-new Date(a.date))
    .map((t,i)=>`<tr>
      <td>${t.date}</td>
      <td><span class="badge ${t.type}">${t.type}</span></td>
      <td>${t.category}</td>
      <td>$${currency(t.amount)}</td>
      <td><button class="delete" data-i="${i}">Delete</button></td>
    </tr>`).join("");
}

function renderSummary(){
  const {income, expense, net} = totals();
  sumIncomeEl.textContent = currency(income);
  sumExpenseEl.textContent = currency(expense);
  sumNetEl.textContent = currency(net);
}

function renderCategoryChart(){
  const {labels, values} = byCategory();
  if(categoryChart) categoryChart.destroy();
  categoryChart = new Chart(categoryCtx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Net by Category', data: values }]},
    options: { responsive: true, maintainAspectRatio:false, scales:{ y:{ beginAtZero:true } } }
  });
}

function render(){ renderTable(); renderSummary(); renderCategoryChart(); }

form.addEventListener("submit", e=>{
  e.preventDefault();
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value.trim() || "General";
  const amount = document.getElementById('amount').value;
  const date = document.getElementById('date').value || new Date().toISOString().slice(0,10);
  state.tx.push({type, category, amount, date});
  save(); render(); form.reset();
});

tbody.addEventListener("click", e=>{
  if(e.target.matches(".delete")){
    const idx = Number(e.target.dataset.i);
    state.tx.splice(idx,1); save(); render();
  }
});

// Seed sample data if empty
if(state.tx.length===0){
  state.tx.push(
    {type:'income', category:'Salary', amount:3000, date:new Date().toISOString().slice(0,10)},
    {type:'expense', category:'Rent', amount:1200, date:new Date().toISOString().slice(0,10)},
    {type:'expense', category:'Groceries', amount:250, date:new Date().toISOString().slice(0,10)}
  ); save();
}
render();
