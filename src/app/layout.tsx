import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'], display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'Окошко — онлайн-запись к мастерам красоты',
    template: '%s | Окошко',
  },
  description:
    'Мини-CRM для мастеров маникюра, бровей, ресниц и парикмахеров: своя страница записи, календарь, клиенты и напоминания в Telegram.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-screen`}>{children}</body>
    </html>
  );
}
