const PALETTE = ['#0e5c4f', '#2f4858', '#7a3b2e', '#4a3b6b', '#1f5673', '#6b4423', '#3f5c2e'];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export default function Avatar({
  name,
  slug,
  size = 'md',
}: {
  name: string;
  slug: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const bg = PALETTE[hash(slug) % PALETTE.length];
  const cls = size === 'md' ? 'avatar' : `avatar ${size}`;
  return (
    <span className={cls} style={{ background: bg }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
