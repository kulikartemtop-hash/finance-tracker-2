// Элементы DOM
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.nav-btn');

// Счета
const totalBalanceEl = document.getElementById('totalBalance');
const accountsList = document.getElementById('accountsList');
const addAccountBtn = document.getElementById('addAccountBtn');

// Расходы
const periodLabel = document.getElementById('periodLabel');
const periodTotal = document.getElementById('periodTotal');
const filterBtns = document.querySelectorAll('.filter-btn');
const accountSelect = document.getElementById('accountSelect');
const smsTextInput = document.getElementById('smsTextInput');
const parseSmsBtn = document.getElementById('parseSmsBtn');
const cameraInput = document.getElementById('cameraInput');
const scanBtn = document.getElementById('scanBtn');
const loading = document.getElementById('loading');
const progress = document.getElementById('progress');
const amountInput = document.getElementById('amountInput');
const categoryInput = document.getElementById('categoryInput');
const subcategoryInput = document.getElementById('subcategoryInput');
const descInput = document.getElementById('descInput');
const addBtn = document.getElementById('addBtn');
const transactionList = document.getElementById('transactionList');
const emptyState = document.getElementById('emptyState');

// Графики
const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
const listViewContainer = document.getElementById('listViewContainer');
const chartViewContainer = document.getElementById('chartViewContainer');
const categoriesList = document.getElementById('categoriesList');
const subcategoriesList = document.getElementById('subcategoriesList');
let expenseChartInstance = null;

// Доходы и Переводы (упрощенные элементы для фокуса на главном)
const monthIncomeTotal = document.getElementById('monthIncomeTotal');
const incomeTypeSelect = document.getElementById('incomeTypeSelect');
const incomeDescInput = document.getElementById('incomeDescInput');
const incomeAccountSelect = document.getElementById('incomeAccountSelect');
const incomeAmountInput = document.getElementById('incomeAmountInput');
const addIncomeBtn = document.getElementById('addIncomeBtn');
const transferFromSelect = document.getElementById('transferFromSelect');
const transferToSelect = document.getElementById('transferToSelect');
const transferAmountInput = document.getElementById('transferAmountInput');
const transferBtn = document.getElementById('transferBtn');

// Состояние
let accounts = [];let transactions = [];
let customCategories = ['🛒 Продукты', '🚕 Транспорт', '🍔 Кафе', '💊 Здоровье', '🛍️ Покупки', '🏠 Дом', '📦 Другое'];
let currentFilter = 'month';
let currentHistoryView = 'list'; // 'list', 'bar', 'pie'

// 1. Инициализация
function loadData() {
    try {
        const savedAccounts = localStorage.getItem('finance_accounts');
        const savedTransactions = localStorage.getItem('finance_transactions');
        const savedCategories = localStorage.getItem('finance_categories');
        
        accounts = savedAccounts ? JSON.parse(savedAccounts) : [
            { id: 1, name: 'Т-Банк', balance: 0, icon: '🟡', goals: [] },
            { id: 2, name: 'Сбербанк', balance: 0, icon: '🟢', goals: [] },
            { id: 3, name: 'Наличные', balance: 0, icon: '💵', goals: [] }
        ];
        
        transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
        if (savedCategories) customCategories = JSON.parse(savedCategories);
        
        saveData(); // Сохраняем структуру с goals, если её не было
    } catch (error) {
        localStorage.clear();
        location.reload();
        return;
    }
    
    renderCategoriesDatalist();
    renderAccounts();
    updateAllAccountSelects();
    renderExpenses();
    renderIncomesAndTransfers();
}

function saveData() {
    localStorage.setItem('finance_accounts', JSON.stringify(accounts));
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
    localStorage.setItem('finance_categories', JSON.stringify(customCategories));
    renderAccounts();
    renderExpenses();
    renderIncomesAndTransfers();
}

// 2. Навигация
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        views.forEach(v => v.classList.remove('active'));
        document.getElementById(btn.dataset.view).classList.add('active');
        navBtns.forEach(b => b.classList.remove('active'));        btn.classList.add('active');
    });
});

// 3. Логика Счетов и Целей
function renderAccounts() {
    accountsList.innerHTML = '';
    let totalWorkingBalance = 0; // Считаем ТОЛЬКО рабочие балансы, игнорируя цели!
    
    accounts.forEach(acc => {
        totalWorkingBalance += acc.balance;
        const li = document.createElement('li');
        li.className = 'account-item';
        
        let goalsHtml = '';
        if (acc.goals && acc.goals.length > 0) {
            goalsHtml = `<div class="goals-section">
                ${acc.goals.map(g => `
                    <div class="goal-item">
                        <span class="goal-name">🎯 ${g.name}</span>
                        <span class="goal-amount">${g.currentAmount.toFixed(0)} / ${g.targetAmount.toFixed(0)} ₽</span>
                    </div>
                `).join('')}
                <button class="btn-add-goal" onclick="addGoal(${acc.id})">+ Добавить цель</button>
            </div>`;
        } else {
            goalsHtml = `<button class="btn-add-goal" onclick="addGoal(${acc.id})">+ Добавить цель (не влияет на общий баланс)</button>`;
        }

        li.innerHTML = `
            <div class="acc-header">
                <div class="acc-info"><span class="acc-icon">${acc.icon}</span><span class="acc-name">${acc.name}</span></div>
                <span class="acc-balance">${acc.balance.toFixed(2)} ₽</span>
            </div>
            ${goalsHtml}
        `;
        accountsList.appendChild(li);
    });
    totalBalanceEl.textContent = totalWorkingBalance.toFixed(2) + ' ₽';
}

window.addGoal = function(accountId) {
    const name = prompt("Название цели (например: Отпуск, Подушка безопасности):");
    if (!name) return;
    const target = parseFloat(prompt("Целевая сумма (₽):"));
    if (!target || target <= 0) return alert("Введите корректную сумму");

    const acc = accounts.find(a => a.id === accountId);
    if (!acc.goals) acc.goals = [];
    acc.goals.push({ id: Date.now(), name: name.trim(), targetAmount: target, currentAmount: 0 });    saveData();
};

function updateAllAccountSelects() {
    [accountSelect, incomeAccountSelect, transferFromSelect, transferToSelect].forEach(select => {
        const currentVal = select.value;
        select.innerHTML = '';
        accounts.forEach(acc => {
            const option = document.createElement('option');
            option.value = acc.id;
            option.textContent = `${acc.icon} ${acc.name} (${acc.balance.toFixed(2)} ₽)`;
            select.appendChild(option);
        });
        if (currentVal) select.value = currentVal;
    });
}

addAccountBtn.addEventListener('click', () => {
    const name = prompt('Название счета:');
    if (name && name.trim()) {
        accounts.push({ id: Date.now(), name: name.trim(), balance: 0, icon: '💳', goals: [] });
        saveData();
        updateAllAccountSelects();
    }
});

// 4. Категории (Пользовательские)
function renderCategoriesDatalist() {
    categoriesList.innerHTML = customCategories.map(c => `<option value="${c}">`).join('');
    // Подкатегории пока берем из существующих категорий для простоты, или пользователь введет свои
    subcategoriesList.innerHTML = customCategories.map(c => `<option value="${c}">`).join('');
}

// 5. Расходы и Графики
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderExpenses();
    });
});

viewToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentHistoryView = btn.dataset.chartType;
        viewToggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (currentHistoryView === 'list') {            listViewContainer.style.display = 'block';
            chartViewContainer.style.display = 'none';
        } else {
            listViewContainer.style.display = 'none';
            chartViewContainer.style.display = 'block';
            renderChart(currentHistoryView);
        }
    });
});

function isDateInFilter(dateStr, filter) {
    const txDate = new Date(dateStr.split('.').reverse().join('-'));
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (filter === 'today') return txDate.getTime() === today.getTime();
    if (filter === 'week') { const w = new Date(today); w.setDate(today.getDate() - 7); return txDate >= w; }
    if (filter === 'month') return txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
    return true;
}

function renderExpenses() {
    transactionList.innerHTML = '';
    let periodSum = 0;
    const filteredTx = transactions.filter(t => t.type === 'expense' && isDateInFilter(t.date, currentFilter)).sort((a, b) => b.id - a.id);
    
    filteredTx.forEach(t => {
        periodSum += t.amount;
        const acc = accounts.find(a => a.id === t.accountId) || { name: 'Удален', icon: '❓' };
        const li = document.createElement('li');
        li.className = 'transaction-item';
        const sub = t.subcategory ? `<span class="t-sub">${t.subcategory}</span>` : '';
        li.innerHTML = `
            <div class="t-info">
                <span class="t-desc">${t.category}</span>
                ${sub}
                <span class="t-date">${t.date} • ${acc.icon} ${acc.name}</span>
            </div>
            <div class="t-right">
                <span class="t-amount expense">-${t.amount.toFixed(2)} ₽</span>
                <button class="btn-delete" onclick="deleteItem(${t.id})">🗑️</button>
            </div>
        `;
        transactionList.appendChild(li);
    });
    
    emptyState.style.display = filteredTx.length ? 'none' : 'block';
    const periodNames = { 'today': 'Сегодня', 'week': 'За неделю', 'month': 'За месяц' };
    periodLabel.textContent = `Расход ${periodNames[currentFilter].toLowerCase()}`;
    periodTotal.textContent = periodSum.toFixed(2) + ' ₽';

    // Если активен вид графика, обновляем его    if (currentHistoryView !== 'list') {
        renderChart(currentHistoryView);
    }
}

function renderChart(type) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (expenseChartInstance) expenseChartInstance.destroy();

    const filteredTx = transactions.filter(t => t.type === 'expense' && isDateInFilter(t.date, currentFilter));
    
    // Агрегация данных по категориям
    const dataMap = {};
    filteredTx.forEach(t => {
        const key = t.subcategory ? `${t.category}: ${t.subcategory}` : t.category;
        dataMap[key] = (dataMap[key] || 0) + t.amount;
    });

    const labels = Object.keys(dataMap);
    const data = Object.values(dataMap);
    const colors = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#5856d6', '#af52de', '#8e8e93'];

    expenseChartInstance = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Расход (₽)',
                data: data,
                backgroundColor: type === 'pie' ? colors : '#007aff',
                borderColor: type === 'pie' ? '#ffffff' : '#0056b3',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: type === 'pie' ? 'bottom' : 'top' }
            }
        }
    });
}

// 6. Добавление расхода
function addExpenseLogic(amount, accountId, category, subcategory, description) {
    if (!amount || amount <= 0) return alert('Введите корректную сумму');

    // Сохраняем новые категории, если их нет
    if (!customCategories.includes(category)) {
        customCategories.push(category);        renderCategoriesDatalist();
    }

    const account = accounts.find(a => a.id === accountId);
    if (account) account.balance -= amount;

    transactions.push({ 
        id: Date.now(), type: 'expense', accountId, amount, category, subcategory: subcategory || '', description, 
        date: new Date().toLocaleDateString('ru-RU') 
    });
    
    saveData();
    updateAllAccountSelects();
    amountInput.value = ''; categoryInput.value = ''; subcategoryInput.value = ''; descInput.value = '';
}

addBtn.addEventListener('click', () => {
    addExpenseLogic(
        parseFloat(amountInput.value),
        parseInt(accountSelect.value),
        categoryInput.value.trim() || '📦 Другое',
        subcategoryInput.value.trim(),
        descInput.value.trim()
    );
});

// 7. Распознавание СМС
parseSmsBtn.addEventListener('click', async () => {
    let text = smsTextInput.value.trim();
    if (!text) {
        try { text = await navigator.clipboard.readText(); smsTextInput.value = text; } 
        catch (err) { return alert('Скопируйте СМС и вставьте в поле'); }
    }
    if (!text) return;

    const amountMatches = text.match(/\d{1,3}(?:\s?\d{3})*(?:[\.,]\d{1,2})?/g);
    let foundAmount = '';
    if (amountMatches) {
        const numbers = amountMatches.map(n => parseFloat(n.replace(/\s/g, '').replace(',', '.')));
        const validAmounts = numbers.filter(n => n > 1 && n < 500000);
        if (validAmounts.length > 0) foundAmount = validAmounts[0].toString();
    }

    const lowerText = text.toLowerCase();
    let detectedCategory = '📦 Другое';
    for (const [category, keywords] of Object.entries({'🛒 Продукты': ['пятерочка', 'магнит', 'ашан', 'вкусвилл'], '🚕 Транспорт': ['яндекс', 'такси', 'метро', 'бензин'], '🍔 Кафе': ['кафе', 'ресторан', 'кофе', 'вкусно']})) {
        if (keywords.some(k => lowerText.includes(k))) { detectedCategory = category; break; }
    }

    amountInput.value = foundAmount;    categoryInput.value = detectedCategory;
    descInput.value = `СМС: ${text.substring(0, 30)}...`;
    smsTextInput.value = '';
    if (navigator.vibrate) navigator.vibrate(50);
    alert('✅ Данные из СМС распознаны!');
});

// 8. Удаление
window.deleteItem = function(id) {
    const tx = transactions.find(t => t.id === id);
    if (!tx || !confirm('Удалить операцию?')) return;

    if (tx.type === 'expense') {
        const acc = accounts.find(a => a.id === tx.accountId);
        if (acc) acc.balance += tx.amount;
    } else if (tx.type === 'income') {
        const acc = accounts.find(a => a.id === tx.accountId);
        if (acc) acc.balance -= tx.amount;
    } else if (tx.type === 'transfer') {
        const fromAcc = accounts.find(a => a.id === tx.fromAccountId);
        const toAcc = accounts.find(a => a.id === tx.toAccountId);
        if (fromAcc) fromAcc.balance += tx.amount;
        if (toAcc) toAcc.balance -= tx.amount;
    }

    transactions = transactions.filter(t => t.id !== id);
    saveData();
    updateAllAccountSelects();
};

// 9. Доходы и Переводы (Базовая логика)
addIncomeBtn.addEventListener('click', () => {
    const amount = parseFloat(incomeAmountInput.value);
    const accountId = parseInt(incomeAccountSelect.value);
    if (!amount || amount <= 0) return alert('Введите сумму');
    const acc = accounts.find(a => a.id === accountId);
    if (acc) acc.balance += amount;
    transactions.push({ id: Date.now(), type: 'income', accountId, amount, description: incomeTypeSelect.value + (incomeDescInput.value ? ': ' + incomeDescInput.value : ''), date: new Date().toLocaleDateString('ru-RU') });
    saveData(); updateAllAccountSelects(); incomeAmountInput.value = ''; incomeDescInput.value = '';
});

transferBtn.addEventListener('click', () => {
    const fromId = parseInt(transferFromSelect.value);
    const toId = parseInt(transferToSelect.value);
    const amount = parseFloat(transferAmountInput.value);
    if (fromId === toId) return alert('Выберите разные счета');
    if (!amount || amount <= 0) return alert('Введите сумму');
    const fromAcc = accounts.find(a => a.id === fromId);
    const toAcc = accounts.find(a => a.id === toId);
    if (fromAcc.balance < amount) return alert('Недостаточно средств');    
    fromAcc.balance -= amount; toAcc.balance += amount;
    transactions.push({ id: Date.now(), type: 'transfer', fromAccountId: fromId, toAccountId: toId, amount, description: `${fromAcc.name} → ${toAcc.name}`, date: new Date().toLocaleDateString('ru-RU') });
    saveData(); updateAllAccountSelects(); transferAmountInput.value = '';
    alert(`Переведено ${amount} ₽`);
});

function renderIncomesAndTransfers() {
    let monthSum = 0;
    const today = new Date();
    transactions.filter(t => {
        if (t.type !== 'income') return false;
        const d = new Date(t.date.split('.').reverse().join('-'));
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).forEach(t => monthSum += t.amount);
    monthIncomeTotal.textContent = monthSum.toFixed(2) + ' ₽';
}

// Запуск
loadData();