import Link from 'next/link';
import { notFound } from 'next/navigation';
import Avatar from '@/components/Avatar';
import Chat from '@/components/Chat';
import { MindCard, PanelCard } from '@/components/Cards';
import {
  minds,
  getMind,
  getMinds,
  panelsForMind,
  questionsForMind,
  categoryLabel,
} from '@/data';

export function generateStaticParams() {
  return minds.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mind = getMind(slug);
  if (!mind) return { title: 'Not found — Sorted' };
  return { title: `${mind.name} — ${mind.headline} | Sorted`, description: mind.bio };
}

export default async function MindPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;
  const mind = getMind(slug);
  if (!mind) notFound();

  const theirPanels = panelsForMind(mind.slug);
  const theirQuestions = questionsForMind(mind.slug);

  // Other people in the same panels — the natural "who else should I ask".
  const alsoAsk = getMinds([
    ...new Set(theirPanels.flatMap((p) => p.minds).filter((s) => s !== mind.slug)),
  ]).slice(0, 3);

  const firstName = mind.name.split(' ')[0];

  return (
    <div className="wrap">
      <p className="crumb">
        <Link href="/discover">Discover</Link> › {mind.name}
      </p>

      <section className="profile-head">
        <Avatar name={mind.name} slug={mind.slug} size="lg" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1>{mind.name}</h1>
          <p className="headline">{mind.headline}</p>
          <div className="meta" style={{ marginTop: 10, gap: 10 }}>
            <span>{mind.city}</span>
            <span aria-hidden="true">•</span>
            <span className="lang">Answers in {mind.languages.join(', ')}</span>
            <span aria-hidden="true">•</span>
            <span className="count">{mind.responses.toLocaleString('en-IN')} answers</span>
          </div>
          <div className="tags" style={{ marginTop: 12 }}>
            {mind.categories.map((c) => (
              <Link key={c} href={`/discover?c=${c}`} className="tag accent">
                {categoryLabel(c)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="split" style={{ marginTop: 34 }}>
        <div>
          <h2 style={{ fontSize: '1.3rem' }}>What they’ve actually lived through</h2>
          <ul className="lived">
            {mind.livedIt.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>

          <p className="lede" style={{ marginTop: 20 }}>
            {mind.bio}
          </p>

          <blockquote className="pull">“{mind.pushesOn}”</blockquote>

          <Chat
            mindSlug={mind.slug}
            mindName={mind.name}
            starters={mind.perspectives.map((p) => p.q)}
            prefill={q}
          />

          <section className="section">
            <div className="section-head">
              <div>
                <h2>{firstName} on the record</h2>
                <p>Positions {firstName} holds, in their own words.</p>
              </div>
            </div>
            <div className="qa">
              {mind.perspectives.map((p) => (
                <article className="qa-item" key={p.q}>
                  <h3 className="q">{p.q}</h3>
                  <p className="a">{p.a}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside>
          <div className="side-card">
            <h4>Composite persona</h4>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--ink-soft)' }}>
              {mind.name} is a composite built from common Indian situations — not a real
              individual. In production this slot is a real person who has opted in, with their
              content ingested and their answers reviewed by them.
            </p>
          </div>

          {theirPanels.length > 0 && (
            <div className="side-card" style={{ marginTop: 14 }}>
              <h4>Also appears in</h4>
              <ul>
                {theirPanels.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/panels/${p.slug}`}>{p.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {theirQuestions.length > 0 && (
            <div className="side-card" style={{ marginTop: 14 }}>
              <h4>Answered</h4>
              <ul>
                {theirQuestions.map((qq) => (
                  <li key={qq.slug}>
                    <Link href={`/questions/${qq.slug}`}>{qq.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {alsoAsk.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <h2>Who else to ask</h2>
              <p>People in the same panels, who often disagree with {firstName}.</p>
            </div>
          </div>
          <div className="grid">
            {alsoAsk.map((m) => (
              <MindCard key={m.slug} mind={m} />
            ))}
          </div>
        </section>
      )}

      {theirPanels.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <h2>Panels</h2>
            </div>
          </div>
          <div className="grid">
            {theirPanels.map((p) => (
              <PanelCard key={p.slug} panel={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
