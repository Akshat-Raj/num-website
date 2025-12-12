import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ChatBot from "../components/ChatBot";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

export const metadata: Metadata = {
  title: "Numerano Teams | Registration",
  description:
    "Register your team with Numerano. Upload ID cards, verify your team, and receive instant confirmation.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "Numerano Teams | Registration",
    description:
      "Register your team with Numerano. Upload ID cards, verify your team, and receive instant confirmation.",
    url: "https://example.com",
    siteName: "Numerano Teams",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${grotesk.variable}`}>
        <div className="page-bg" />
        <div className="page-grid" />
        {children}
        <ChatBot />
      </body>
    </html>
  );
}

