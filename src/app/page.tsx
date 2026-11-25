import Link from 'next/link';

// Stage 1 placeholder landing. The real marketing page arrives in stage 7.
export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-16">
      <section className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-500 text-2xl font-bold text-white shadow-soft">
          О
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-stone-900">
          Окошко
        </h1>
        <p className="mt-3 text-lg text-stone-600">
          Онлайн-запись и мини-CRM для мастеров красоты. Этап 1 из 8: проект,
          база данных и инфраструктура готовы.
        </p>
      </section>

      <section className="rounded-xl2 border border-stone-200 bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-stone-900">
          Проверить демо-страницу записи
        </h2>
        <p className="mt-2 text-stone-600">
          После <code className="rounded bg-stone-100 px-1.5 py-0.5 text-sm">npm run db:seed</code>{' '}
          доступна публичная страница демо-мастера:
        </p>
        <Link
          href="/m/elena-nails"
          className="mt-4 inline-flex items-center rounded-xl bg-coral-500 px-6 py-3 font-medium text-white shadow-soft transition hover:bg-coral-600"
        >
          /m/elena-nails — Елена, маникюр
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {[
          ['Стек', 'Next.js 14 · TypeScript · Tailwind · Prisma · MySQL 8'],
          ['Данные', 'Полная схема: мастера, услуги, расписание, записи, платежи'],
          ['Инфраструктура', 'Docker Compose: приложение + MySQL, health-check'],
          ['Дальше', 'Этап 2 — регистрация и онбординг мастера'],
        ].map(([title, text]) => (
          <div
            key={title}
            className="rounded-xl2 border border-stone-200 bg-white p-5 shadow-card"
          >
            <h3 className="font-semibold text-stone-900">{title}</h3>
            <p className="mt-1 text-sm text-stone-600">{text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
