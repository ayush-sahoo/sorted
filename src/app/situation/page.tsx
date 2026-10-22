import Link from 'next/link';
import SituationBox from '@/components/SituationBox';
import { MindCard, PanelCard, QuestionCard } from '@/components/Cards';
import { match, fallbackMinds } from '@/lib/match';

export const metadata = { title: 'Your situation — Sorted' };

export default async function Situation({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const result = query ? match(query) : null;
  const hasMatches = Boolean(result && result.minds.length > 0);

  return (
    <div className="wrap">
      <p className="crumb">
        <Link href="/">Home</Link> › Your situation
      </p>

      <section style={{ paddingTop: 18 }}>
        <p className="eyebrow">You said</p>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', maxWidth: '34ch' }}>
          {query || 'Describe your situation'}
        </h1>

        {result && result.matchedTags.length > 0 && (
          <div className="tags" style={{ marginTop: 16 }}>
            {result.matchedTags.slice(0, 8).map((t) => (
              <span key={t} className="tag clay">
                {t}
              </span>
            ))}
          </div>
        )}
      </section>

      {hasMatches ? (
        <>
          <section className="section">
            <div className="section-head">
              <div>
                <h2>These people have been here</h2>
                <p>Ranked by how closely their situation matches yours. Ask any of them directly.</p>
              </div>
            </div>
            <div className="grid">
              {result!.minds.map(({ mind, why }) => (
                <MindCard key={mind.slug} mind={mind} why={why} />
              ))}
            </div>
          </section>

          {result!.panels.length > 0 && (
            <section className="section">
              <div className="section-head">
                <div>
                  <h2>Or ask a whole panel</h2>
                </div>
              </div>
              <div className="grid">
                {result!.panels.map(({ panel }) => (
                  <PanelCard key={panel.slug} panel={panel} />
                ))}
              </div>
            </section>
          )}

          {result!.questions.length > 0 && (
            <section className="section">
              <div className="section-head">
                <div>
                  <h2>People have asked this before</h2>
                </div>
              </div>
              <div className="grid two">
                {result!.questions.map((qq) => (
                  <QuestionCard key={qq.slug} question={qq} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="section">
          <div className="empty" style={{ textAlign: 'left' }}>
            <h3 style={{ marginBottom: 8 }}>Nobody on Sorted has lived through this yet.</h3>
            <p style={{ margin: 0, color: 'var(--muted)' }}>
              {query
                ? 'Try naming the concrete decision — the exam, the city, the amount, the person pushing you. Or start from one of these, who get asked about the widest range of situations.'
                : 'Tell us what you are deciding and we will find people who have made that call.'}
            </p>
          </div>
          <div className="grid" style={{ marginTop: 18 }}>
            {fallbackMinds(4).map((m) => (
              <MindCard key={m.slug} mind={m} />
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Describe it differently</h2>
            <p>More specifics — numbers, city, who else is involved — gives a better match.</p>
          </div>
        </div>
        <SituationBox initial={query} />
      </section>
    </div>
  );
}
