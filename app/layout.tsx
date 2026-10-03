import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/shell/app-shell";
import { ToastProvider } from "@/components/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "firefly", template: "%s · firefly" },
  description: "hackathons for hiring: builders show how they build, companies see the evidence.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

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
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
