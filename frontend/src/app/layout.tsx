import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import Script from "next/script";
import Providers from "@/components/Providers";
import Navigation from "@/components/Navigation";
import NoiseOverlay from "@/components/ui/NoiseOverlay";
import ThemeProvider from "@/components/ThemeProvider";
import ClientLayout from "@/components/ClientLayout";

import GlobalClientComponents from "@/components/GlobalClientComponents";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Braj Accounting | Modern Ledger Management",
  description: "Breathtakingly beautiful cloud accounting for the modern age.",
};

// Final stable build of RootLayout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased selection:bg-violet-500/30 min-h-full flex flex-col bg-background text-foreground`}>
        {/* Theme script to prevent flicker */}
        <Script
          id="theme-switcher"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('braj-accounting-theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                  if (!theme && supportDarkMode) theme = '{"state":{"theme":"dark"}}';
                  if (theme) {
                    var themeValue = JSON.parse(theme).state.theme;
                    if (themeValue === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <Providers>
          <ThemeProvider>
            <NoiseOverlay />
            <GlobalClientComponents />
            <Navigation />
            <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
              <ClientLayout>
                {children}
              </ClientLayout>
            </main>
            
            <footer className="relative z-10 py-6 text-center no-print">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-premium border-white/5 text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Braj Accounting Engine v1.0.4 • Stable
              </div>
            </footer>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
