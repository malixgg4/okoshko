# Окошко

**Онлайн-запись и мини-CRM для мастеров красоты** — маникюр, брови, ресницы, парикмахеры.

Мастер регистрируется, заполняет услуги, цены и график работы, получает персональную ссылку вида `okoshko.ru/m/ivanova` — и клиенты записываются сами, без звонков и переписок в личных сообщениях. Клиенту не нужен аккаунт: только имя и телефон. Клиент и мастер получают напоминания в Telegram.

> Проект строится поэтапно (8 этапов). Сейчас готов **этап 1**: структура проекта, база данных, Docker-инфраструктура, скелет приложения и демо-данные.

## Стек

| Слой | Технологии |
|---|---|
| Фронтенд | Next.js 14 (App Router), React, TypeScript (strict), Tailwind CSS |
| Бэкенд | Route Handlers / Server Actions, zod для валидации всех входов |
| База данных | MySQL 8 + Prisma ORM |
| Аутентификация | Auth.js (NextAuth) — email + пароль, позже Telegram Login Widget |
| Telegram | grammY, webhook `/api/telegram/webhook` |
| Платежи | ЮKassa (интерфейс `PaymentProvider` + mock-провайдер) |
| Инфраструктура | Docker + docker-compose |

## Быстрый старт (Docker)

```bash
git clone https://github.com/malixgg4/okoshko.git
cd okoshko
cp .env.example .env          # можно ничего не менять для локального запуска
docker compose up -d --build  # поднимет MySQL + приложение
docker compose exec app npm run db:seed   # демо-данные
```

Откройте:

- `http://localhost:3000` — заглушка главной
- `http://localhost:3000/m/elena-nails` — публичная страница демо-мастера
- `http://localhost:3000/api/health` — health-check (проверяет и БД)

**Демо-доступы** (пароль у обоих `demo1234`): `admin@okoshko.app` (админ), `elena@okoshko.app` (мастер).

## Локальная разработка без Docker

```bash
npm install               # + prisma generate (postinstall)
npm run db:push           # применить схему (DATABASE_URL в .env должен указывать на вашу MySQL)
npm run db:seed
npm run dev
```

## Структура проекта

```
okoshko/
├── prisma/
│   ├── schema.prisma      # полная модель данных (10 моделей, 8 enum-ов)
│   └── seed.ts            # демо-мастер, услуги, расписание, клиенты, записи
├── src/
│   ├── app/
│   │   ├── page.tsx                    # заглушка главной (этап 7 — лендинг)
│   │   ├── m/[slug]/page.tsx           # публичная страница мастера + SEO/OG
│   │   └── api/health/route.ts         # health-check с проверкой БД
│   ├── lib/
│   │   ├── prisma.ts       # singleton-клиент Prisma
│   │   └── env.ts          # валидация env через zod
│   └── ...
├── docs/
│   └── index.html          # витрина проекта для GitHub Pages
├── Dockerfile              # multi-stage сборка (deps → build → runtime)
├── docker-compose.yml      # приложение + MySQL 8 с health-check
└── .env.example            # все переменные окружения с комментариями
```

## Модель данных (кратко)

`User` (MASTER/ADMIN) → `MasterProfile` (slug, план FREE/PRO, правила записи) → `Service`, `WorkingHours` (несколько смен в день), `TimeOff`, `Client` (уникален по телефону в рамках мастера), `Appointment` (уникальный индекс `masterId + startAt` — жёсткая защита от двойной записи), `Reminder` (CLIENT_24H / CLIENT_2H / MASTER_NEW), `Payment` и `Subscription` (ЮKassa, автопродление).

Тарифы: **FREE** — 30 записей в месяц, 5 услуг. **PRO** — 390 ₽/мес или 3900 ₽/год: без лимитов, Telegram-напоминания клиентам, CSV-экспорт, без плашки «Made on Окошко». Новым мастерам — 14 дней PRO бесплатно.

## Переменные окружения

См. [.env.example](.env.example) — все переменные с комментариями: БД, NextAuth, Telegram-бот, cron-секрет, платежи.

## Онлайн-витрина

Статическая презентация проекта доступна на GitHub Pages:

**https://malixgg4.github.io/okoshko/**

(деплой из папки `docs/` через workflow `.github/workflows/deploy-pages.yml`)

## Роадмап

- [x] **Этап 1** — структура, Docker, схема БД, seed, скелет приложения
- [ ] **Этап 2** — регистрация и онбординг мастера (Auth.js, профиль, услуги, график)
- [ ] **Этап 3** — генерация слотов + публичная страница записи + unit-тесты
- [ ] **Этап 4** — кабинет мастера: календарь, клиенты, ручные записи
- [ ] **Этап 5** — Telegram-бот и напоминания
- [ ] **Этап 6** — тарифы, лимиты, ЮKassa (mock → реальный провайдер)
- [ ] **Этап 7** — админка, статистика, лендинг, `/privacy` и `/terms` (152-ФЗ)
- [ ] **Этап 8** — деплой на VPS (nginx, HTTPS, webhook, cron) и чек-лист запуска
