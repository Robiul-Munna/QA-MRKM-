import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/test-run-history?status=pass&dateFrom=2024-01-01&dateTo=2024-06-01&testName=login
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status'); // pass, fail, visual-diff, etc
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const testName = searchParams.get('testName');

  const where: any = {};
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.executedAt = {};
    if (dateFrom) where.executedAt.gte = new Date(dateFrom);
    if (dateTo) where.executedAt.lte = new Date(dateTo);
  }
  if (testName) where.testName = { contains: testName, mode: 'insensitive' };

  const testRuns = await prisma.testRun.findMany({
    where,
    orderBy: { executedAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ testRuns });
}
