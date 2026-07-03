import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jyotish Studio",
  description: "Vedic astrology practice management: kundlis, clients, videos and classes.",
};

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/clients", label: "Clients & Kundlis" },
  { href: "/videos", label: "Videos" },
  { href: "/classes", label: "Classes & Payments" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              🕉️ Jyotish Studio
            </Link>
            <nav className="flex gap-6 text-sm font-medium text-zinc-600">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-zinc-950"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
