import type { Metadata } from 'next';
import { AuthProvider } from '../contexts/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '../index.css';

export const metadata: Metadata = {
  title: 'True Story【実話の物語】| これは、あなたの物語かもしれない。',
  description: '実話を基に楽曲制作・映像制作を行うTrue Story【実話の物語】。誰かの実話で、誰かが歌い、誰かが演じます。決まったマニュアルはありません。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          {children}
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
