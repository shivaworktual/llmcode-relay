import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const refreshToken = body.refreshToken;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Missing refreshToken parameter.' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Server missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.' },
        { status: 500 },
      );
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return NextResponse.json({ error: `Token refresh failed: ${tokenRes.status} ${err}` }, { status: 400 });
    }

    const data = (await tokenRes.json()) as { access_token: string; expires_in: number };

    return NextResponse.json({
      accessToken: data.access_token,
      expiry: Date.now() + data.expires_in * 1000,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
