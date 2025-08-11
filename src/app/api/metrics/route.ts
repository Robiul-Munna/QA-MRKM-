import { NextResponse } from "next/server";

export async function GET() {
  // Replace with real data source or database query
  return NextResponse.json({
    totalTests: 120,
    passed: 110,
    failed: 10,
    bugs: 3,
    coverage: 92
  });
}
