import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { QueryProvider } from '@/components/layout/QueryProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'PropFirmHub — Compare Prop Firms & Find the Best Deals',
    template: '%s | PropFirmHub',
  },
  description: 'The most comprehensive prop trading firm directory. Compare funding, profit splits, rules, and reviews for all major prop firms.',
  keywords: ['prop firm', 'funded trading', 'proprietary trading', 'prop trading comparison'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://propfirmhub.com',
    siteName: 'PropFirmHub',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@propfirmhub',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            {children}
            <Toaster position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
