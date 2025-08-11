import { NextResponse } from 'next/server';

// POST /api/testrail
export async function POST(req) {
  try {
    const { runId, caseId, statusId, comment } = await req.json();
    const testrailDomain = process.env.TESTRAIL_DOMAIN; // e.g. yourcompany.testrail.io
    const testrailUser = process.env.TESTRAIL_USER;
    const testrailApiKey = process.env.TESTRAIL_API_KEY;
    if (!testrailDomain || !testrailUser || !testrailApiKey) {
      return NextResponse.json({ error: 'TestRail credentials not set.' }, { status: 500 });
    }
    const response = await fetch(`https://${testrailDomain}/index.php?/api/v2/add_result_for_case/${runId}/${caseId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${testrailUser}:${testrailApiKey}`).toString('base64'),
      },
      body: JSON.stringify({ status_id: statusId, comment }),
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'TestRail error' }, { status: 500 });
    }
    return NextResponse.json({ result: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
