import type { Metadata } from 'next';
import './globals.css';

import { Inter, Outfit } from 'next/font/google';
import { GeistMono } from 'geist/font/mono';

import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { AuthSessionProvider } from "@/components/auth-session-provider";
import { QueryProvider } from "@/components/query-provider";
import { Analytics } from '@vercel/analytics/next';

// Two-font system: Inter carries body/UI (font-sans); Outfit carries headings
// and display numbers (font-heading). Geist Mono stays for codes/tabular data.
// Each loader exposes a CSS variable consumed by globals.css.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
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
        className={`${inter.variable} ${outfit.variable} ${GeistMono.variable} font-sans antialiased min-h-screen`}
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
