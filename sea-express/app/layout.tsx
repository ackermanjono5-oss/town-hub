import type { Metadata } from 'next';
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SignInPrompt from '@/components/SignInPrompt';
import AppLinkFix from '@/components/AppLinkFix';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// The nav and home screen follow the Town Hub prototype, which is set in
// Plus Jakarta Sans. Exposed as a variable and applied only by those two,
// so the rest of the app keeps Geist until the restyle reaches it.
// next/font self-hosts the files at build time, so this still works in the
// offline Android build.
const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Town Hub | Garden Route Community',
  description:
    'News, events, directory, real estate, and emergency services for the Garden Route, South Africa.',
  keywords: ['mossel bay', 'george', 'knysna', 'plettenberg bay', 'garden route'],
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#1c6cb8',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} min-h-full flex flex-col antialiased`}
      >
        <AppLinkFix />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <SignInPrompt />
      </body>
    </html>
  );
}
