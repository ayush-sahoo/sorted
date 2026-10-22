import Link from 'next/link';
import { notFound } from 'next/navigation';
import Avatar from '@/components/Avatar';
import { QuestionCard } from '@/components/Cards';
import SituationBox from '@/components/SituationBox';
import { questions, getQuestion, getMind, categoryLabel } from '@/data';

export function generateStaticParams() {
  return questions.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const question = getQuestion(slug);
  if (!question) return { title: 'Not found — Sorted' };
  return { title: `${question.title} — Sorted`, description: question.context };
}

export default async function QuestionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const question = getQuestion(slug);
  if (!question) notFound();

  const others = questions.filter((q) => q.slug !== question.slug && q.category === question.category).slice(0, 4);

  return (
    <div className="wrap">
      <p className="crumb">
        <Link href="/">Home</Link> ›{' '}
        <Link href={`/discover?c=${question.category}`}>{categoryLabel(question.category)}</Link> ›
        Question
      </p>

      <section style={{ paddingTop: 22 }}>
        <p className="eyebrow">{question.answers.length} perspectives</p>
        <h1 style={{ fontSize: 'clamp(1.7rem, 4.4vw, 2.5rem)', maxWidth: '30ch' }}>
          {question.title}
        </h1>
        <p className="lede">{question.context}</p>
      </section>

      <section className="section">
        <div className="card" style={{ padding: '6px 20px' }}>
          {question.answers.map((a) => {
            const mind = getMind(a.mind);
            if (!mind) return null;
            return (
              <div className="take" key={a.mind}>
                <Avatar name={mind.name} slug={mind.slug} />
                <div className="body">
                  <div className="who">
                    <Link href={`/minds/${mind.slug}`}>{mind.name}</Link>
                  </div>
                  <div className="who-sub">{mind.headline}</div>
                  <p className="text">{a.take}</p>
                  <div style={{ marginTop: 10 }}>
                    <Link
                      href={`/minds/${mind.slug}?q=${encodeURIComponent(question.title)}`}
                      className="btn sm ghost"
                    >
                      Ask {mind.name.split(' ')[0]} about your version →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Your version is different</h2>
            <p>Describe your specifics and we will match you to people who faced exactly that.</p>
          </div>
        </div>
        <SituationBox initial={question.title} />
      </section>

      {others.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <h2>Related questions</h2>
            </div>
          </div>
          <div className="grid two">
            {others.map((q) => (
              <QuestionCard key={q.slug} question={q} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
