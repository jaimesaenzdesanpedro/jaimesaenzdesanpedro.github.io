import { Syne, DM_Sans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import Disclaimer from '@/components/Disclaimer';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata = {
  title: 'AlphaLens — AI-powered market research',
  description:
    'Markets analyzed in seconds. AI-powered market research for retail investors.',
};

// Avoid a flash of the wrong theme: apply the stored preference before paint.
const themeScript = `(function(){try{var t=localStorage.getItem('alphalens-theme');if(t==='light'){document.documentElement.classList.add('light');}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${syne.variable} ${dmSans.variable}`} suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="flex min-h-screen flex-col bg-bg text-ink">
          <div className="flex-1">{children}</div>
          <Disclaimer />
        </body>
      </html>
    </ClerkProvider>
  );
}
