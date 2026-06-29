import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CPAnalytics — Track Your Competitive Programming Journey',
    template: '%s | CPAnalytics',
  },
  description:
    'A production-grade dashboard to track your Codeforces, LeetCode performance, rating history, problem analytics, and compete on leaderboards.',
  keywords: ['competitive programming', 'codeforces', 'leetcode', 'analytics', 'dashboard'],
  authors: [{ name: 'Sonal' }],
  openGraph: {
    title: 'CPAnalytics',
    description: 'Track your competitive programming journey',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={inter.variable}>
        <body className="min-h-screen bg-background font-sans antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
