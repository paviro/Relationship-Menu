import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "./components/ui/Toast";
import LayoutWrapper from "./components/LayoutWrapper";
import ThemeProvider from "./components/ThemeProvider";
import { THEME_STORAGE_KEY } from "./utils/themeStorage";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Relationship Menu - Reflect on and Define Your Relationships",
  description: "Reflect on and define your romantic, platonic, familial, or professional relationships through shared dialogue — explore shared needs, wants, and boundaries.",
  keywords: [
    "Boundaries",
    "Collaborative Relationships",
    "Customizable Relationships",
    "ENM",
    "ENM Relationship",
    "Ethical Non-Monogamy",
    "Ethical Non-Monogamy",
    "Monogamy",
    "Needs and Wants",
    "Non-Escalator Relationship",
    "Non-Escalator Relationship Menu",
    "Non-Monogamy",
    "Polyamory",
    "Relationship",
    "Relationship Agreement",
    "Relationship Anarchy",
    "Relationship Anarchy Smorgasbord",
    "Relationship Boundaries",
    "Relationship Definition",
    "Relationship Dialogue",
    "Relationship Frameworks",
    "Relationship Menu",
    "Relationship Reflection"
  ],
  creator: "Paul-Vincent Roll",
  formatDetection: {
    email: false,
    telephone: true,
    address: false,
  },
  metadataBase: new URL("https://relationshipmenu.org"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Relationship Menu - Reflect on and Define Your Relationships",
    description: "Reflect on and define your romantic, platonic, familial, or professional relationships through shared dialogue — explore shared needs, wants, and boundaries.",
    url: "https://relationshipmenu.org",
    siteName: "Relationship Menu",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        {/* Inline script to apply theme before hydration to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
                  var prefs = stored ? JSON.parse(stored) : {};
                  var colorMode = prefs.colorMode || 'system';
                  var vision = prefs.vision || 'default';
                  var contrast = prefs.contrast || 'normal';

                  var resolvedMode = colorMode;
                  if (colorMode === 'system') {
                    resolvedMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }

                  document.documentElement.setAttribute('data-color-mode', resolvedMode);
                  document.documentElement.setAttribute('data-vision', vision);
                  document.documentElement.setAttribute('data-contrast', contrast);
                } catch (e) {
                  document.documentElement.setAttribute('data-color-mode', 'light');
                  document.documentElement.setAttribute('data-vision', 'default');
                  document.documentElement.setAttribute('data-contrast', 'normal');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${nunito.variable} antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
