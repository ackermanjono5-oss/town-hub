import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased`}
      >
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
