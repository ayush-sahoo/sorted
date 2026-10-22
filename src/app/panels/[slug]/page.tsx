import Link from 'next/link';
import { notFound } from 'next/navigation';
import Avatar from '@/components/Avatar';
import { QuestionCard } from '@/components/Cards';
import { panels, getPanel, getMinds, questions, categoryLabel } from '@/data';
import { closestPerspective } from '@/lib/persona';

export function generateStaticParams() {
  return panels.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const panel = getPanel(slug);
  if (!panel) return { title: 'Not found — Sorted' };
  return { title: `${panel.title} — Sorted`, description: `Ask them ${panel.subtitle}.` };
}

export default async function PanelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const panel = getPanel(slug);
  if (!panel) notFound();

  const members = getMinds(panel.minds);
  // Show each member's take on *this* panel's topic, not whichever
  // perspective happens to be first on their profile.
  const topic = `${panel.title} ${panel.subtitle}`;
  const related = questions
    .filter((q) => q.category === panel.category)
    .slice(0, 4);

  return (
    <div className="wrap">
      <p className="crumb">
        <Link href="/discover">Discover</Link> ›{' '}
        <Link href={`/discover?c=${panel.category}`}>{categoryLabel(panel.category)}</Link> › Panel
      </p>

      <section style={{ paddingTop: 22 }}>
        <p className="eyebrow">Panel · {members.length} people</p>
        <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 2.8rem)', maxWidth: '26ch' }}>{panel.title}</h1>
        <p className="lede">Ask them {panel.subtitle}. They do not agree with each other.</p>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>The panel</h2>
            <p>Each of them will answer from their own situation. Open any one to ask follow-ups.</p>
          </div>
        </div>

        <div className="card" style={{ padding: '6px 20px' }}>
          {members.map((m) => (
            <div className="take" key={m.slug}>
              <Avatar name={m.name} slug={m.slug} />
              <div className="body">
                <div className="who">
                  <Link href={`/minds/${m.slug}`}>{m.name}</Link>
                </div>
                <div className="who-sub">
                  {m.headline} · {m.city}
                </div>
                <p className="text">{closestPerspective(m, topic).a}</p>
                <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Link href={`/minds/${m.slug}`} className="btn sm ghost">
                    Ask {m.name.split(' ')[0]} →
                  </Link>
                  <span className="composite-note">Composite persona</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <h2>Questions in this area</h2>
            </div>
          </div>
          <div className="grid two">
            {related.map((q) => (
              <QuestionCard key={q.slug} question={q} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
