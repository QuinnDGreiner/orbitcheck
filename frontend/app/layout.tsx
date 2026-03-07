import type { Metadata } from 'next';
import '../styles/globals.css';
import CursorInit from '@/components/CursorInit';
import ScrollRevealInit from '@/components/ScrollRevealInit';

export const metadata: Metadata = {
  title: 'OrbitCheck — Starlink vs. Your ISP',
  description: 'Answer 7 questions. Get a personalized Starlink suitability score, provider comparison, and interactive coverage map.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css" />
      </head>
      <body>
        <div id="cursor" />
        <div id="noise" />
        <CursorInit />
        <ScrollRevealInit />
        {children}
      </body>
    </html>
  );
}
