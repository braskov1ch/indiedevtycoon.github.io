# Indie Dev Tycoon

> Build your studio. Ship your games. Survive the industry.

Браузерный симулятор инди-разработчика игр: начинаешь один в выбранном году и постепенно проходишь историю игровой индустрии — от PS2 и первого iPhone до Switch, Epic Games Store и PS5.

**Game by [@braskov1ch](https://github.com/braskov1ch) · v0.1beta · © 2026**

---

## 🎮 Что это

Indie Dev Tycoon — это mobile-first браузерная игра, которая сочетает:

- симулятор разработки игр;
- idle / offline-механики;
- экономический симулятор;
- исторический таймлайн игровой индустрии;
- управление инди-студией;
- работу с издателями и самоиздание;
- контрактную разработку;
- собственные движки и IP-франшизы;
- DLC, порты, ремейки, переиздания;
- конкурентов и рыночные тренды;
- награды и случайные события.

Игра **не клон** Mad Games Tycoon 2. Фокус — именно на пути одиночки-инди, который строит студию с нуля.

---

## 🚀 Как запустить

### Локально

1. Скачай или склонируй репозиторий.
2. Открой `index.html` в любом современном браузере.

Никаких сборок, npm, node.js, серверов или зависимостей не требуется.

### Онлайн

Игра опубликована через GitHub Pages:

- https://braskov1ch.github.io/

Если игра развёрнута в подпапке:

- https://braskov1ch.github.io/indie-dev-tycoon/

---

## 📦 Как задеплоить на GitHub Pages

### Вариант 1 — User Pages (главный сайт)

1. Открой репозиторий `braskov1ch/braskov1ch.github.io`.
2. Загрузи файлы проекта в корень репозитория (сохрани структуру папок).
3. Убедись, что `index.html` лежит в корне.
4. Commit → через 30–60 секунд сайт обновится по адресу `https://braskov1ch.github.io`.

### Вариант 2 — подпапка

1. Создай в репозитории папку `indie-dev-tycoon/`.
2. Загрузи файлы внутрь неё.
3. Открой `https://braskov1ch.github.io/indie-dev-tycoon/`.

### Вариант 3 — отдельный репозиторий

1. Создай новый публичный репозиторий `indie-dev-tycoon`.
2. Загрузи файлы в корень.
3. **Settings → Pages → Source: Deploy from a branch → main / root → Save**.
4. Игра будет доступна по адресу `https://braskov1ch.github.io/indie-dev-tycoon/`.

### Через git CLI

```bash
git clone https://github.com/braskov1ch/braskov1ch.github.io.git
cd braskov1ch.github.io
# скопируй все файлы игры в эту папку
git add .
git commit -m "Add Indie Dev Tycoon v0.1beta"
git push origin main
