import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/userinfo.email',
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const port = searchParams.get('port') || '49152';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  if (!clientId) {
    return NextResponse.json(
      { error: 'Missing GOOGLE_CLIENT_ID environment variable on server.' },
      { status: 500 },
    );
  }

  const redirectUri = `${appUrl}/api/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: port, // pass local CLI port as state
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
