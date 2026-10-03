import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "firefly",
  description: "hiring cohorts where builders show how they build",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 z-critical bg-emphasis text-on-emphasis type-button rounded-control px-4 py-3"
        >
          skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
