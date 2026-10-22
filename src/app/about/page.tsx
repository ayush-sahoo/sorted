import Link from 'next/link';
import { minds, panels, questions } from '@/data';

export const metadata = { title: 'How Sorted works' };

export default function About() {
  return (
    <div className="wrap">
      <p className="crumb">
        <Link href="/">Home</Link> › About
      </p>

      <section style={{ paddingTop: 22, maxWidth: '68ch' }}>
        <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 2.7rem)' }}>How Sorted works</h1>

        <p className="lede">
          You describe a situation. Sorted matches it to people who have lived through that exact
          thing in India, and you ask them follow-up questions until the answer actually fits your
          case.
        </p>

        <h2 style={{ marginTop: 36, fontSize: '1.35rem' }}>Why an India-specific version</h2>
        <p className="lede" style={{ marginTop: 10 }}>
          The decisions that dominate Indian life mostly do not exist in global advice. A fourth
          UPSC attempt at 26. A ₹55 lakh education loan secured against your parents’ house. The
          30-day public notice under the Special Marriage Act. GST on exported services. A ₹72,000
          EMI against a 95-minute commute. A rishta you have three weeks to respond to. Generic
          advice is not slightly off for these — it is useless, because the constraints are legal,
          financial and familial all at once.
        </p>

        <h2 style={{ marginTop: 36, fontSize: '1.35rem' }}>What is in this build</h2>
        <ul className="lived" style={{ marginTop: 14 }}>
          <li>
            <strong>{minds.length} people</strong> across {panels.length} panels and{' '}
            {questions.length} quick questions, all India-specific.
          </li>
          <li>
            <strong>Situation matching</strong> — a hand-written Hinglish and abbreviation lexicon
            maps what you type (“CTC”, “rishta”, “H1B”, “ghar”, “EMI”, “LUT”) onto the situations
            people here have lived.
          </li>
          <li>
            <strong>Follow-up conversation</strong> — each person answers in their own voice, from
            their own constraints, and pushes a question back at you.
          </li>
        </ul>

        <h2 style={{ marginTop: 36, fontSize: '1.35rem' }}>About the people on this page</h2>
        <div className="banner" style={{ marginTop: 14 }}>
          Every persona in this build is a <strong>composite</strong>, assembled from situations that
          are common in India. None of them is a real individual, and none is based on a specific
          named person. They exist so the product can be judged before real experts are onboarded.
        </div>
        <p className="lede" style={{ marginTop: 16 }}>
          In production each slot is a real person who has opted in: their own content is ingested
          with consent, answers are generated in their voice with citations back to what they
          actually said, and they can review and correct anything attributed to them. Nobody is
          cloned without asking.
        </p>

        <h2 style={{ marginTop: 36, fontSize: '1.35rem' }}>What this is not</h2>
        <p className="lede" style={{ marginTop: 10 }}>
          Not medical, legal or investment advice. Several people here talk about tax, immigration
          and marriage law because they went through it — that is lived experience, not professional
          counsel, and anything with real money or real legal risk needs a CA, a lawyer or a
          registered adviser who can see your papers.
        </p>

        <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/" className="btn">
            Describe your situation
          </Link>
          <Link href="/discover" className="btn ghost">
            Browse everyone
          </Link>
        </div>
      </section>
    </div>
  );
}
