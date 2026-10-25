import type { Metadata, Viewport } from "next";
import "./globals.css";

/*
 * Fonts are loaded as a stylesheet link rather than through next/font/google.
 *
 * next/font/google is the better production choice — it downloads the files at
 * BUILD time and self-hosts them, so a diner's phone makes no request to Google
 * at all. It needs network access to fonts.googleapis.com while building, which
 * the sandbox this was written in does not have. README.md -> "Self-hosting the
 * fonts" has the three-line swap; do it once and you lose a third-party request
 * on every page load.
 *
 * preconnect matters here: without it the browser discovers fonts.gstatic.com
 * only after parsing the CSS, which costs a second round trip before any text
 * can paint in the real face.
 */
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Public+Sans:wght@400;500;600;700&display=swap";

/*
 * The fallback title only. Every page a guest actually lands on overrides it
 * with the restaurant's name READ FROM THE DATABASE (see generateMetadata in
 * app/m/[slug]/page.tsx), so renaming the restaurant in the admin renames the
 * browser tab too, with no deploy.
 */
export const metadata: Metadata = {
  title: {
    default: "Tromsø Restaurant",
    template: "%s — Tromsø Restaurant",
  },
  description: "Scan the code on your table, read the menu in your language, and order.",
  openGraph: {
    title: "Tromsø Restaurant",
    description: "Scan the code on your table, read the menu in your language, and order.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // A diner WILL want to pinch-zoom a menu. Never add maximumScale: 1 here.
  themeColor: "#fbf8f4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning because the theme boot script sets data-theme on
    // this element before React hydrates, so the server HTML and the live DOM
    // legitimately differ by that one attribute. It suppresses the warning for
    // this element's attributes only, not for its subtree.
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONT_HREF} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
