/**
 * Demo data seeder (stage 1).
 *
 * Creates: a platform admin, one demo master on a 14-day PRO trial with
 * services, working hours (split shifts), clients and one upcoming
 * appointment, so the app is testable right after `docker compose up`.
 *
 * Run: npm run db:seed
 *
 * Demo credentials (email / password):
 *   admin@okoshko.app / demo1234
 *   elena@okoshko.app / demo1234
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'demo1234';
const DEMO_MASTER_SLUG = 'elena-nails';
const DAY = 24 * 60 * 60 * 1000;

/** Wall-clock time for @db.Time columns (date part is ignored by MySQL). */
function t(hour: number, minute = 0): Date {
  return new Date(Date.UTC(2000, 0, 1, hour, minute, 0));
}

/** A Date at Europe/Moscow (UTC+3) wall clock, N days from today. */
function moscowAt(dayOffset: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dayOffset);
  d.setUTCHours(hour - 3, minute, 0, 0);
  return d;
}

async function main() {
  // Reset demo data (order respects FK constraints). Safe to re-run.
  await prisma.reminder.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.timeOff.deleteMany({});
  await prisma.workingHours.deleteMany({});
  await prisma.masterProfile.deleteMany({ where: { slug: DEMO_MASTER_SLUG } });
  await prisma.user.deleteMany({
    where: { email: { in: ['admin@okoshko.app', 'elena@okoshko.app'] } },
  });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.user.create({
    data: {
      email: 'admin@okoshko.app',
      passwordHash,
      name: 'Админ Окошка',
      role: 'ADMIN',
    },
  });

  const masterUser = await prisma.user.create({
    data: {
      email: 'elena@okoshko.app',
      passwordHash,
      name: 'Елена Смирнова',
      phone: '+79001234567',
      role: 'MASTER',
      masterProfile: {
        create: {
          slug: DEMO_MASTER_SLUG,
          displayName: 'Елена — маникюр и покрытие',
          bio: 'Аккуратный маникюр с покрытием гель-лаком. Стерильные инструменты, работаю на премиум материалах. Кофе и уютное кресло в подарок.',
          city: 'Москва',
          address: 'ул. Примерная, 1, студия «Локон», 2 этаж',
          timezone: 'Europe/Moscow',
          plan: 'PRO',
          planExpiresAt: new Date(Date.now() + 14 * DAY), // 14-day trial
          trialUsedAt: new Date(),
          bookingBufferMin: 15,
          minNoticeHours: 2,
          maxDaysAhead: 30,
          subscription: {
            create: { autoRenew: false },
          },
        },
      },
    },
    include: { masterProfile: true },
  });

  const masterId = masterUser.masterProfile!.id;

  // Services
  const services = await Promise.all(
    [
      { name: 'Маникюр классический', durationMin: 60, priceRub: 2000, sortOrder: 1, description: 'Обрезной маникюр, покрытие обычным лаком' },
      { name: 'Маникюр + гель-лак', durationMin: 90, priceRub: 2800, sortOrder: 2, description: 'Комбинированный маникюр и покрытие гель-лаком' },
      { name: 'Наращивание ногтей', durationMin: 180, priceRub: 5000, sortOrder: 3, description: 'Коррекция и наращивание формы' },
      { name: 'Снятие покрытия', durationMin: 30, priceRub: 500, sortOrder: 4, description: 'Снятие чужого покрытия с обработкой' },
    ].map((s) =>
      prisma.service.create({
        data: { ...s, masterId, isActive: true },
      }),
    ),
  );

  // Working hours: Mon–Fri split shifts 10:00–14:00 and 15:00–19:00,
  // Saturday single shift 11:00–16:00, Sunday is a day off.
  const hours: { weekday: number; start: Date; end: Date; isDayOff?: boolean }[] = [];
  for (let weekday = 1; weekday <= 5; weekday++) {
    hours.push({ weekday, start: t(10), end: t(14) });
    hours.push({ weekday, start: t(15), end: t(19) });
  }
  hours.push({ weekday: 6, start: t(11), end: t(16) });
  hours.push({ weekday: 0, start: t(0), end: t(0), isDayOff: true });

  await prisma.workingHours.createMany({
    data: hours.map((h) => ({
      masterId,
      weekday: h.weekday,
      startTime: h.start,
      endTime: h.end,
      isDayOff: h.isDayOff ?? false,
    })),
  });

  // A short vacation block next week to demo TimeOff
  await prisma.timeOff.create({
    data: {
      masterId,
      startAt: moscowAt(8, 0),
      endAt: moscowAt(9, 23, 59),
      reason: 'Отпуск',
    },
  });

  // Clients
  const [maria, olga] = await Promise.all([
    prisma.client.create({
      data: { masterId, name: 'Мария Кузнецова', phone: '+79161234567', note: 'Любит нюдовые оттенки, тонкие ногти' },
    }),
    prisma.client.create({
      data: { masterId, name: 'Ольга Петрова', phone: '+79037778899' },
    }),
  ]);

  // One upcoming appointment (tomorrow 12:00, гель-лак)
  const gelService = services[1];
  const appointment = await prisma.appointment.create({
    data: {
      masterId,
      clientId: maria.id,
      serviceId: gelService.id,
      startAt: moscowAt(1, 12, 0),
      endAt: moscowAt(1, 13, 30),
      status: 'CONFIRMED',
      priceRub: gelService.priceRub,
      source: 'ONLINE',
      clientNote: 'Хочу нюд с блёстками',
    },
  });

  // Client reminders for that appointment
  await prisma.reminder.createMany({
    data: [
      { appointmentId: appointment.id, type: 'CLIENT_24H', sendAt: moscowAt(0, 12, 0) },
      { appointmentId: appointment.id, type: 'CLIENT_2H', sendAt: moscowAt(1, 10, 0) },
    ],
  });

  // A completed appointment in the past for history demo
  await prisma.appointment.create({
    data: {
      masterId,
      clientId: olga.id,
      serviceId: services[0].id,
      startAt: moscowAt(-7, 15, 0),
      endAt: moscowAt(-7, 16, 0),
      status: 'COMPLETED',
      priceRub: services[0].priceRub,
      source: 'MANUAL',
    },
  });

  console.log('Seed complete.');
  console.log('Demo master public page: /m/' + DEMO_MASTER_SLUG);
  console.log('Logins (password demo1234): admin@okoshko.app, elena@okoshko.app');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
