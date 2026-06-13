console.log("✅ app.js загружен!");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM готов");

    const btn = document.getElementById('addAccountBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            alert('Кнопка "Добавить счет" работает!');
        });
        console.log("Кнопка найдена");
    } else {
        console.error("Кнопка addAccountBtn не найдена!");
    }

    // Попробуем создать счет вручную
    try {
        localStorage.setItem('test', 'works');
        console.log("localStorage работает");
    } catch (e) {
        console.error("localStorage недоступен", e);
    }
});