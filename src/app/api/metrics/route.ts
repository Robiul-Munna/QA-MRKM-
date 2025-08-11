import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  // Aggregate metrics from the TestRun table
  const [totalTests, passed, failed, bugs, avgCoverage] = await Promise.all([
    prisma.testRun.count(),
    prisma.testRun.count({ where: { status: "passed" } }),
    prisma.testRun.count({ where: { status: "failed" } }),
    prisma.testRun.aggregate({ _sum: { bugCount: true } }),
    prisma.testRun.aggregate({ _avg: { coverage: true } })
  ]);

  return NextResponse.json({
    totalTests,
    passed,
    failed,
    bugs: bugs._sum.bugCount || 0,
    coverage: Math.round(avgCoverage._avg.coverage || 0)
  });
}
