import { NextResponse } from 'next/server';

// POST /api/jira
export async function POST(req) {
  try {
    const { summary, description, projectKey } = await req.json();
    const jiraDomain = process.env.JIRA_DOMAIN; // e.g. yourcompany.atlassian.net
    const jiraEmail = process.env.JIRA_EMAIL;
    const jiraToken = process.env.JIRA_API_TOKEN;
    if (!jiraDomain || !jiraEmail || !jiraToken) {
      return NextResponse.json({ error: 'Jira credentials not set.' }, { status: 500 });
    }
    const response = await fetch(`https://${jiraDomain}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64'),
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          project: { key: projectKey },
          summary,
          description,
          issuetype: { name: 'Bug' },
        },
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.errorMessages || data.errors || 'Jira error' }, { status: 500 });
    }
    return NextResponse.json({ key: data.key, url: `https://${jiraDomain}/browse/${data.key}` });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
