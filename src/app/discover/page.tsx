import Filters from '@/components/Filters';
import { MindCard, PanelCard } from '@/components/Cards';
import { mindsInCategory, panels, categoryLabel } from '@/data';

export const metadata = { title: 'Discover — Sorted' };

export default async function Discover({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const active = c ?? 'all';
  const people = mindsInCategory(active);
  const relevantPanels =
    active === 'all' ? panels.slice(0, 4) : panels.filter((p) => p.category === active);

  return (
    <div className="wrap">
      <p className="crumb">Discover</p>
      <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 2.7rem)', marginTop: 10 }}>
        {active === 'all' ? 'Everyone on Sorted' : categoryLabel(active)}
      </h1>
      <p className="lede">
        {people.length} {people.length === 1 ? 'person' : 'people'} who have lived through it, and
        will tell you what it cost.
      </p>

      <div style={{ marginTop: 24 }}>
        <Filters active={active} />
      </div>

      {relevantPanels.length > 0 && (
        <section className="section" style={{ paddingTop: 8 }}>
          <div className="section-head">
            <div>
              <h2>Panels</h2>
              <p>Ask a whole group at once.</p>
            </div>
          </div>
          <div className="grid">
            {relevantPanels.map((p) => (
              <PanelCard key={p.slug} panel={p} />
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <div>
            <h2>People</h2>
          </div>
        </div>
        {people.length === 0 ? (
          <div className="empty">Nobody here yet for this topic.</div>
        ) : (
          <div className="grid">
            {people.map((m) => (
              <MindCard key={m.slug} mind={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
