import type { Metadata } from "next";
import { Chat } from "@/components/chat";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tech Merch Finder",
  description: "Find and order branded tech merch with an AI assistant",
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
