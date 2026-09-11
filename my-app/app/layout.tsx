import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import HeaderNav from './components/common/HeaderNav';
import { ThemeProvider } from './components/common/ThemeProvider';

export const metadata: Metadata = {
  title: 'CalPal — Your Cute Calorie Buddy',
  description:
    'Track your daily calories, macros, and meals with CalPal. Minimal, cute, and easy to use.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Inline Anti-Flash Script to prevent hydration theme jump */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var saved = localStorage.getItem('calpal_theme');
                    var isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
                    if (isDark) {
                      document.documentElement.classList.add('dark');
                      document.documentElement.setAttribute('data-theme', 'dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.setAttribute('data-theme', 'light');
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
        </head>
        <body className="bg-bg-primary text-text-primary transition-colors duration-300 antialiased min-h-screen">
          <ThemeProvider>
            <HeaderNav />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
