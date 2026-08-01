import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CalPal — Your Cute Calorie Buddy",
  description: "Track your daily calories, macros, and meals with CalPal. Minimal, cute, and easy to use.",
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
