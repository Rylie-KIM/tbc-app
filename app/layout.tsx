import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk } from 'next/font/google';
import './globals.css';

const hanken = Hanken_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '700'], variable: '--font-hanken', display: 'swap' });

export const metadata: Metadata = {
  title: 'TBC. Sponsors and hackathons, in one place',
  description: 'Early preview: TBC helps hackathon organisers find sponsors and sponsors find events worth backing.',
  icons: { icon: '/brand/logo.png' },
  robots: { index: false, follow: false }, // early preview: keep out of search results until it is shared on purpose
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={hanken.variable}>
      <body>{children}</body>
    </html>
  );
}
