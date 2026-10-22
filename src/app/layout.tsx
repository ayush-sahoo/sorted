import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sorted — find Indians who have been there',
  description:
    'Describe your situation and hear from Indians who have actually lived through it: UPSC attempts, ESOPs, H-1B queues, home loans, family pressure, shutting a company down.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;550;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="site-header">
          <div className="bar">
            <Link href="/" className="logo">
              Sorted<span className="dot" />
            </Link>
            <nav className="nav">
              <Link href="/discover">Discover</Link>
              <Link href="/discover?c=upsc-govt" className="hide-sm">
                UPSC
              </Link>
              <Link href="/discover?c=money" className="hide-sm">
                Money
              </Link>
              <Link href="/discover?c=family" className="hide-sm">
                Family
              </Link>
              <Link href="/about">About</Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="wrap row">
            <span>Sorted — ask someone who has been there.</span>
            <Link href="/about">How this works</Link>
            <Link href="/discover">Discover</Link>
            <span style={{ marginLeft: 'auto' }}>
              Seed personas are composites, not real individuals.
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
