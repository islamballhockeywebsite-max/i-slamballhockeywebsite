import type { Metadata } from "next";
import { Anta } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const anta = Anta({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: "400",
});

const sprintura = localFont({
  src: "../fonts/Sprintura.otf",
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "I-Slam Ball Hockey",
  description: "I-Slam Ball Hockey League",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anta.variable} ${sprintura.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
