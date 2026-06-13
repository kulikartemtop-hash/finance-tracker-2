console.log("✨ Finanze v2.0 — премиум-версия запущена");

// Элементы DOM
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.nav-btn');
const totalBalanceEl = document.getElementById('totalBalance');
const accountsList = document.getElementById('accountsList');
const addAccountBtn = document.getElementById('addAccountBtn');
const accountSelect = document.getElementById('accountSelect');
const amountInput = document.getElementById('amountInput');
const categoryInput = document.getElementById('categoryInput');
const descInput = document.getElementById('descInput');
const addBtn = document.getElementById('addBtn');
const transactionList = document.getElementById('transactionList');
const emptyState = document.getElementById('emptyState');
const periodLabel = document.getElementById('periodLabel');
const periodTotal = document.getElementById('periodTotal');
const monthIncomeTotal = document.getElementById('monthIncomeTotal');
const incomeAccountSelect = document.getElementById('incomeAccountSelect');
const incomeAmountInput = document.getElementById('incomeAmountInput');
const incomeDescInput = document.getElementById('incomeDescInput');
const addIncomeBtn = document.getElementById('addIncomeBtn');

// Состояние
let accounts = [];
let transactions = [];
let currentFilter = 'month';

// 1. Инициализация
function loadData() {
    try {
        const savedAccounts = localStorage.getItem('finance_accounts');
        const savedTransactions = localStorage.getItem('finance_transactions');
        
        accounts = savedAccounts ? JSON.parse(savedAccounts) : [
            { id: 1, name: 'Т-Банк', balance: 0, icon: '🏦' },
            { id: 2, name: 'Сбербанк', balance: 0, icon: '💳' },
            { id: 3, name: 'Наличные', balance: 0, icon: '💵' }
        ];
        
        transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
        
        saveData();
    } catch (e) {
        console.error("Ошибка инициализации:", e);
        localStorage.clear();
        location.reload();
        return;
    }
        renderAccounts();
    updateAccountSelect();
    renderExpenses();
}

function saveData() {
    localStorage.setItem('finance_accounts', JSON.stringify(accounts));
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
}

// 2. Навигация
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        views.forEach(v => v.classList.remove('active'));
        document.getElementById(btn.dataset.view).classList.add('active');
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// 3. Счета
function renderAccounts() {
    accountsList.innerHTML = '';
    let total = 0;
    accounts.forEach(acc => {
        total += acc.balance;
        const li = document.createElement('li');
        li.className = 'account-item';
        li.innerHTML = `
            <div><span>${acc.icon}</span> <span>${acc.name}</span></div>
            <div>${acc.balance.toFixed(2)} ₽</div>
        `;
        accountsList.appendChild(li);
    });
    totalBalanceEl.textContent = total.toFixed(2) + ' ₽';
}

function updateAccountSelect() {
    [accountSelect, incomeAccountSelect].forEach(select => {
        select.innerHTML = '';
        accounts.forEach(acc => {
            const opt = document.createElement('option');
            opt.value = acc.id;
            opt.textContent = `${acc.icon} ${acc.name} (${acc.balance.toFixed(2)} ₽)`;
            select.appendChild(opt);
        });
    });
}

addAccountBtn.addEventListener('click', () => {    const name = prompt('Название счета:');
    if (name && name.trim()) {
        accounts.push({ id: Date.now(), name: name.trim(), balance: 0, icon: '💰' });
        saveData();
        renderAccounts();
        updateAccountSelect();
    }
});

// 4. Расходы
function renderExpenses() {
    transactionList.innerHTML = '';
    let sum = 0;
    const filtered = transactions.filter(t => t.type === 'expense').sort((a,b)=>b.id-a.id);
    filtered.forEach(t => {
        sum += t.amount;
        const acc = accounts.find(a=>a.id===t.accountId)||{name:'?'}; 
        const li = document.createElement('li');
        li.className = 'transaction-item';
        li.innerHTML = `
            <div>
                <div class="t-desc">${t.category}</div>
                <div class="t-date">${t.description}</div>
            </div>
            <div class="t-amount expense">-${t.amount.toFixed(2)} ₽</div>
        `;
        transactionList.appendChild(li);
    });
    emptyState.style.display = filtered.length ? 'none' : 'block';
    periodTotal.textContent = sum.toFixed(2) + ' ₽';
}

addBtn.addEventListener('click', () => {
    const amt = parseFloat(amountInput.value);
    const accId = parseInt(accountSelect.value);
    if (!amt || amt <= 0) return alert('Сумма должна быть > 0');
    const acc = accounts.find(a => a.id === accId);
    if (acc) acc.balance -= amt;
    transactions.push({
        id: Date.now(),
        type: 'expense',
        accountId: accId,
        amount: amt,
        category: categoryInput.value || '📦 Другое',
        description: descInput.value || 'Без описания',
        date: new Date().toLocaleDateString('ru-RU')
    });
    saveData();
    renderAccounts();
    renderExpenses();    amountInput.value = ''; descInput.value = ''; categoryInput.value = '';
});

// 5. Доходы
addIncomeBtn.addEventListener('click', () => {
    const amt = parseFloat(incomeAmountInput.value);
    const accId = parseInt(incomeAccountSelect.value);
    if (!amt || amt <= 0) return alert('Сумма должна быть > 0');
    const acc = accounts.find(a => a.id === accId);
    if (acc) acc.balance += amt;
    transactions.push({
        id: Date.now(),
        type: 'income',
        accountId: accId,
        amount: amt,
        description: incomeDescInput.value || 'Доход',
        date: new Date().toLocaleDateString('ru-RU')
    });
    saveData();
    renderAccounts();
    renderExpenses();
    incomeAmountInput.value = ''; incomeDescInput.value = '';
});

// Запуск
loadData();