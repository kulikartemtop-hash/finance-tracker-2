// Проверка загрузки скрипта
console.log("JavaScript загружен!");

// Элементы DOM
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.nav-btn');

// Навигация
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const viewId = btn.dataset.view;
        
        // Скрыть все вкладки
        views.forEach(v => v.classList.remove('active'));
        
        // Показать нужную
        document.getElementById(viewId).classList.add('active');
        
        // Сделать кнопку активной
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        console.log("Переключено на вкладку:", viewId);
    });
});

// Проверка кнопки "Добавить счет"
document.getElementById('addAccountBtn').addEventListener('click', () => {
    alert("Кнопка работает!");
});