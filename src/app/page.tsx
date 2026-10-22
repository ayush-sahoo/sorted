import Link from 'next/link';
import SituationBox from '@/components/SituationBox';
import { MindCard, PanelCard, QuestionCard } from '@/components/Cards';
import { panels, questions, minds, getMinds } from '@/data';

const FEATURED_PANELS = [
  'upsc-after-attempts',
  'negotiating-an-offer',
  'ms-abroad-on-a-loan',
  'told-parents-no',
  'laid-off-and-rebuilt',
  'rent-vs-buy-metro',
];

export default function Home() {
  const featured = FEATURED_PANELS.map((s) => panels.find((p) => p.slug === s)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );

  const topMinds = [...minds].sort((a, b) => b.responses - a.responses).slice(0, 4);
  const totalAnswers = minds.reduce((n, m) => n + m.responses, 0);

  return (
    <div className="wrap">
      <section className="hero">
        <p className="eyebrow">For India</p>
        <h1>Find people who’ve actually been there.</h1>
        <p className="sub">
          Describe your situation — the UPSC attempt, the ESOP offer, the ₹55 lakh loan, the rishta
          you don’t want. Hear from Indians who lived through that exact thing, with the rupee
          figures and the family politics left in.
        </p>
        <SituationBox />
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Ask people who’ve lived it</h2>
            <p>Curated panels — ask all of them at once, or one at a time.</p>
          </div>
          <Link href="/discover" className="more">
            All {minds.length} people →
          </Link>
        </div>
        <div className="grid">
          {featured.map((p) => (
            <PanelCard key={p.slug} panel={p} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Ask a quick question</h2>
            <p>One decision, several people who made it differently.</p>
          </div>
        </div>
        <div className="grid two">
          {questions.slice(0, 6).map((q) => (
            <QuestionCard key={q.slug} question={q} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Most asked this week</h2>
            <p>
              <span className="count">{totalAnswers.toLocaleString('en-IN')}</span> answers given so
              far.
            </p>
          </div>
        </div>
        <div className="grid">
          {topMinds.map((m) => (
            <MindCard key={m.slug} mind={m} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="split">
          <div>
            <h2>Why not just ask on Reddit?</h2>
            <p className="lede">
              Because the person who answers there is anonymous, and you have no idea whether they
              cleared the exam, paid off the loan, or shut the company down properly. On Sorted every
              answer comes from someone whose specific situation is on the page — four attempts, a
              ₹48 lakh loan at 10.75%, 14 people let go on a Tuesday — and you can ask them follow-up
              questions until it actually applies to you.
            </p>
            <p className="lede" style={{ marginTop: 14 }}>
              The people here are not life coaches. They are people who were where you are, some
              years ago, and remember the numbers.
            </p>
          </div>
          <div className="side-card">
            <h4>Where the advice gap is widest</h4>
            <ul>
              {getMinds([
                'meera-raghavan',
                'faizan-qureshi',
                'ayesha-sheikh',
                'tanvi-shah',
                'imran-ali',
              ]).map((m) => (
                <li key={m.slug}>
                  <Link href={`/minds/${m.slug}`}>
                    <strong>{m.name.split(' ')[0]}</strong> — {m.headline.toLowerCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
