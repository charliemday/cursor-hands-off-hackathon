import type { Metadata } from "next";
import { Chat } from "@/components/chat";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tech Merch Finder",
  description: "Find tech merch on Amazon with an AI agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
