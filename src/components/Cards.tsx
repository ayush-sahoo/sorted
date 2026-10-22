import Link from 'next/link';
import Avatar from './Avatar';
import type { Mind, Panel, Question } from '@/data/types';
import { getMinds } from '@/data';

export function MindCard({ mind, why }: { mind: Mind; why?: string[] }) {
  return (
    <Link href={`/minds/${mind.slug}`} className="card">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar name={mind.name} slug={mind.slug} />
        <div style={{ minWidth: 0 }}>
          <h3>{mind.name}</h3>
          <div className="meta">{mind.city}</div>
        </div>
      </div>
      <p>{mind.headline}</p>
      {why && why.length > 0 && (
        <div className="tags">
          {why.map((w) => (
            <span className="tag accent" key={w}>
              {w}
            </span>
          ))}
        </div>
      )}
      <div className="foot meta">
        <span className="lang">{mind.languages.join(' · ')}</span>
        <span aria-hidden="true">•</span>
        <span className="count">{mind.responses.toLocaleString('en-IN')} answers</span>
      </div>
    </Link>
  );
}

export function PanelCard({ panel }: { panel: Panel }) {
  const members = getMinds(panel.minds);
  return (
    <Link href={`/panels/${panel.slug}`} className="card panel-card">
      <div className="stack">
        {members.map((m) => (
          <Avatar key={m.slug} name={m.name} slug={m.slug} size="sm" />
        ))}
      </div>
      <h3>{panel.title}</h3>
      <p>Ask them {panel.subtitle}.</p>
      <div className="foot meta">
        <span className="count">{members.length} people</span>
        <span aria-hidden="true">•</span>
        <span>{members.reduce((n, m) => n + m.responses, 0).toLocaleString('en-IN')} answers</span>
      </div>
    </Link>
  );
}

export function QuestionCard({ question }: { question: Question }) {
  const members = getMinds(question.answers.map((a) => a.mind));
  return (
    <Link href={`/questions/${question.slug}`} className="card">
      <h3 style={{ fontFamily: 'var(--display)', fontSize: '1.08rem' }}>{question.title}</h3>
      <div className="foot" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="stack">
          {members.map((m) => (
            <Avatar key={m.slug} name={m.name} slug={m.slug} size="sm" />
          ))}
        </div>
        <span className="meta count">{question.answers.length} perspectives</span>
      </div>
    </Link>
  );
}
