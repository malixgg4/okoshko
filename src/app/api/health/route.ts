import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Liveness + database readiness probe (used by Docker HEALTHCHECK
// and by uptime monitors in production).
export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'ok',
      db: 'up',
      ms: Date.now() - startedAt,
      time: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        status: 'degraded',
        db: 'down',
        ms: Date.now() - startedAt,
        time: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
