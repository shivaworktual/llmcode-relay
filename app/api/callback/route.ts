import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const port = searchParams.get('state') || '49152';
  const error = searchParams.get('error');

  if (error) {
    return new NextResponse(renderHtmlError(`Google authentication cancelled: ${error}`), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (!code) {
    return new NextResponse(renderHtmlError('Missing authorization code from Google.'), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const redirectUri = `${appUrl}/api/callback`;

  if (!clientId || !clientSecret) {
    return new NextResponse(
      renderHtmlError('Server error: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured.'),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      return new NextResponse(
        renderHtmlError(`Failed to exchange token with Google: ${tokenRes.status} ${errBody}`),
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
      );
    }

    const tokenData = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    // 2. Fetch user's email address
    let email = 'Unknown';
    try {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (userRes.ok) {
        const u = (await userRes.json()) as { email: string };
        email = u.email || 'Unknown';
      }
    } catch {
      // Non-fatal
    }

    const payload = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiry: Date.now() + tokenData.expires_in * 1000,
      email,
      relayUrl: appUrl,
    };

    return new NextResponse(renderHtmlSuccess(payload, port), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err: any) {
    return new NextResponse(renderHtmlError(err.message || String(err)), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}

function renderHtmlSuccess(payload: any, port: string): string {
  const jsonStr = JSON.stringify(payload);
  const base64Str = Buffer.from(jsonStr, 'utf8').toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>LLM Code — Connected to Gmail</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      background: #0f141c;
      color: #e6edf3;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      max-width: 480px;
      width: 100%;
      padding: 32px;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
      text-align: center;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 16px;
      color: #3fb950;
    }
    h1 {
      font-size: 24px;
      margin: 0 0 8px 0;
      color: #ffffff;
    }
    p {
      color: #8b949e;
      line-height: 1.5;
      margin: 8px 0 20px 0;
    }
    .email-badge {
      display: inline-block;
      background: #1f242c;
      border: 1px solid #388bfd;
      color: #58a6ff;
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .status {
      font-size: 14px;
      color: #3fb950;
      font-weight: 500;
      margin-top: 10px;
    }
    .fallback-box {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #30363d;
      text-align: left;
    }
    .btn {
      background: #238636;
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      transition: background 0.2s;
    }
    .btn:hover { background: #2ea043; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <h1>Connected to Gmail!</h1>
    <div class="email-badge">${payload.email}</div>
    <p>Your Google account has been authorized. We are handing off credentials to your local terminal...</p>
    <div id="status" class="status">⚡ Connecting to llmcode on your machine...</div>

    <div class="fallback-box">
      <p style="font-size: 12px; margin-bottom: 10px;">Using remote SSH or server? Copy the token code manually:</p>
      <button class="btn" onclick="copyToken()">Copy Token for CLI</button>
    </div>
  </div>

  <script>
    const payload = ${JSON.stringify(payload)};
    const port = "${port}";
    const base64 = "${base64Str}";

    async function sendToLocalCli() {
      const statusEl = document.getElementById('status');
      try {
        const res = await fetch('http://127.0.0.1:' + port + '/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          statusEl.textContent = '✓ Done! You can close this tab and return to your terminal.';
          statusEl.style.color = '#3fb950';
          setTimeout(() => window.close(), 3000);
        }
      } catch (e) {
        statusEl.textContent = 'Ready! Return to your terminal or copy token below.';
        statusEl.style.color = '#8b949e';
      }
    }

    function copyToken() {
      navigator.clipboard.writeText('/gmail token ' + base64);
      alert('Token copied! Paste into llmcode terminal: /gmail token <token>');
    }

    sendToLocalCli();
  </script>
</body>
</html>`;
}

function renderHtmlError(errMsg: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>LLM Code — Authentication Failed</title>
  <style>
    body { background: #0f141c; color: #ff7b72; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: #161b22; border: 1px solid #f85149; border-radius: 8px; max-width: 480px; padding: 24px; }
    h1 { color: #f85149; font-size: 20px; }
    p { color: #c9d1d9; font-size: 14px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <h1>✗ Authentication Failed</h1>
    <p>${errMsg}</p>
    <p style="color: #8b949e;">Please return to your terminal and try again.</p>
  </div>
</body>
</html>`;
}
