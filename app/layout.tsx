import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LLM Code — OAuth Relay',
  description: '1-Click Google OAuth Relay for LLM Code',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
