import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import Script from "next/script";
import Providers from "@/components/Providers";
import Navigation from "@/components/Navigation";
import NoiseOverlay from "@/components/ui/NoiseOverlay";
import ThemeProvider from "@/components/ThemeProvider";
import ClientLayout from "@/components/ClientLayout";
import SmoothScroll from "@/components/ui/SmoothScroll";

import GlobalClientComponents from "@/components/GlobalClientComponents";
import AuthGuard from "@/components/AuthGuard";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Braj Quantum Ledger | Structural Financial Intelligence",
  description: "The world's most advanced, monochromatic accounting ecosystem for institutional-grade financial oversight.",
  keywords: ["accounting", "quantum ledger", "financial intelligence", "GST", "enterprise", "spatial finance"],
  authors: [{ name: "Braj Quantum" }],
  openGraph: {
    title: "Braj Quantum Ledger",
    description: "Institutional-grade spatial accounting. The end of grid view.",
    type: "website",
    locale: "en_US",
    siteName: "Braj Quantum Ledger",
  },
  twitter: {
    card: "summary_large_image",
    title: "Braj Quantum Ledger",
    description: "Institutional-grade spatial accounting. The end of grid view.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased selection:bg-white/20 min-h-full flex flex-col bg-background text-foreground cursor-none`}>
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
            <SmoothScroll>
              <NoiseOverlay />
              <GlobalClientComponents />
              <Navigation />
              <main className="flex-1 relative z-10">
                <AuthGuard>
                  <ClientLayout>
                    {children}
                  </ClientLayout>
                </AuthGuard>
              </main>
              
              <footer className="relative z-10 py-12 text-center no-print">
                <div className="inline-flex flex-col items-center gap-4">
                  <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-pro border border-white/5 text-[10px] text-white/40 uppercase tracking-[0.3em] font-black">
                    <span className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
                    Quantum Ledger Core &mdash; v2.0.0
                  </div>
                  <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black">
                    Institutional Intelligence &bull; Verified Structural Equilibrium
                  </p>
                </div>
              </footer>
            </SmoothScroll>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
