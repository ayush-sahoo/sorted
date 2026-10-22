import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap">
      <section style={{ padding: '72px 0' }}>
        <p className="eyebrow">404</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)' }}>Nobody here by that name.</h1>
        <p className="lede">
          The page you were looking for does not exist. Start from a situation instead.
        </p>
        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <Link href="/" className="btn">
            Go home
          </Link>
          <Link href="/discover" className="btn ghost">
            Browse everyone
          </Link>
        </div>
      </section>
    </div>
  );
}
