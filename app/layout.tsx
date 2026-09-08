import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SupportSense | Support command center",
  description: "AI-assisted ticket triage and known-issue intelligence.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
