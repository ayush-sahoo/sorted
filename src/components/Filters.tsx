'use client';

import Link from 'next/link';
import { categories } from '@/data/categories';

export default function Filters({ active }: { active: string }) {
  return (
    <nav className="filters" aria-label="Filter by topic">
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={c.slug === 'all' ? '/discover' : `/discover?c=${c.slug}`}
          className="chip"
          aria-pressed={c.slug === active}
        >
          {c.label}
        </Link>
      ))}
    </nav>
  );
}
