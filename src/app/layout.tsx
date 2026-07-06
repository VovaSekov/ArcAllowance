import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://arcallowance.xyz"),
  title: "ArcAllowance",
  description: "Policy controls for AI agents spending USDC on Arc.",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }]
  },
  openGraph: {
    title: "ArcAllowance",
    description: "Budgets before autonomy for AI agents spending USDC on Arc.",
    images: ["/brand/arcallowance-wordmark.png"]
  },
  twitter: {
    card: "summary_large_image",
    site: "@arcallowans",
    title: "ArcAllowance",
    description: "Budgets before autonomy for AI agents spending USDC on Arc.",
    images: ["/brand/arcallowance-wordmark.png"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
