import type { Metadata } from 'next';
import './globals.css';

import { Syne } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { AuthSessionProvider } from "@/components/auth-session-provider";
import { QueryProvider } from "@/components/query-provider";
import { Analytics } from '@vercel/analytics/next';

// Display face for English headings/numbers (font-syne). Geist Sans/Mono carry
// body and code. Each loader exposes a CSS variable consumed by globals.css.
const syne = Syne({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-syne-src',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SUT-CARIA — Advisory & Curriculum Platform',
  description: 'แพลตฟอร์มให้คำแนะนำการศึกษาและแสดงข้อมูลหลักสูตรของมหาวิทยาลัยเทคโนโลยีสุรนารี (SUT)',
  keywords: ['career', 'advisory', 'SUT', 'curriculum', 'digital career', 'SUT-CARIA'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${GeistSans.variable} ${GeistMono.variable} font-sans antialiased min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AuthSessionProvider>
              <QueryProvider>
                {children}
              </QueryProvider>
            </AuthSessionProvider>
          </LanguageProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
