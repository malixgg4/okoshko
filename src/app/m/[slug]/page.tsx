import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// Public master page: /m/{slug}. Stage 1 shows the master card and
// price list; interactive slot selection arrives in stage 3.
export const dynamic = 'force-dynamic';

type PageProps = { params: { slug: string } };

export async function generateMetadata({ params }: PageProps) {
  const master = await prisma.masterProfile.findUnique({
    where: { slug: params.slug },
  });
  if (!master) {
    return { title: 'Мастер не найден' };
  }
  const description =
    master.bio.length > 160 ? master.bio.slice(0, 157) + '...' : master.bio;
  return {
    title: `${master.displayName} — онлайн-запись`,
    description,
    openGraph: {
      title: `${master.displayName} — онлайн-запись через Окошко`,
      description,
      type: 'website',
    },
  };
}

export default async function MasterPublicPage({ params }: PageProps) {
  const master = await prisma.masterProfile.findUnique({
    where: { slug: params.slug },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
  if (!master) notFound();

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <div className="rounded-xl2 border border-stone-200 bg-white p-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-coral-100 text-2xl font-semibold text-coral-700">
            {master.displayName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              {master.displayName}
            </h1>
            {master.city && (
              <p className="text-sm text-stone-500">{master.city}</p>
            )}
          </div>
        </div>

        <p className="mt-4 whitespace-pre-line text-stone-600">{master.bio}</p>
        {master.address && (
          <p className="mt-2 text-sm text-stone-500">{master.address}</p>
        )}
      </div>

      <h2 className="mt-8 text-lg font-semibold text-stone-900">
        Услуги и цены
      </h2>
      <ul className="mt-3 divide-y divide-stone-100 rounded-xl2 border border-stone-200 bg-white shadow-card">
        {master.services.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium text-stone-900">{s.name}</p>
              <p className="text-sm text-stone-500">
                {s.durationMin} мин
                {s.description ? ` · ${s.description}` : ''}
              </p>
            </div>
            <p className="whitespace-nowrap font-semibold text-coral-600">
              {s.priceRub.toLocaleString('ru-RU')} ₽
            </p>
          </li>
        ))}
        {master.services.length === 0 && (
          <li className="p-4 text-sm text-stone-500">
            Мастер ещё не добавил услуги.
          </li>
        )}
      </ul>

      <p className="mt-8 text-center text-xs text-stone-400">
        Запись через «Окошко»
      </p>
    </main>
  );
}
