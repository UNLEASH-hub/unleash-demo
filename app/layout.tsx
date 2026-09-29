import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://unleash-match.yossy063g.chatgpt.site'),
  title: 'UNLEASH | 自分らしくつながる',
  description: 'ゲイ・バイのための、クリーンで心地よいマッチングスペース。',
  openGraph: {
    title: 'UNLEASH | 自分らしくつながる',
    description: 'ゲイ・バイのための、クリーンで心地よいマッチングスペース。',
    type: 'website',
    locale: 'ja_JP',
    images: [{ url: '/og.png', width: 1733, height: 907, alt: 'UNLEASH — 自分らしく、つながる。' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UNLEASH | 自分らしくつながる',
    description: 'ゲイ・バイのための、クリーンで心地よいマッチングスペース。',
    images: ['/og.png'],
  },
  icons: {
    icon: '/assets/icons/UNLEASHアイコン.png',
    apple: '/assets/icons/UNLEASHアイコン.png',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
