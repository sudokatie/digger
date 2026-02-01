import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Digger',
  description: 'Lode Runner style puzzle platformer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#1a1a2e]">{children}</body>
    </html>
  );
}
