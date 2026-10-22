import { match } from '@/lib/match';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let q = '';
  try {
    const body = (await req.json()) as { q?: string };
    q = (body.q ?? '').slice(0, 1000);
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!q.trim()) {
    return Response.json({ error: 'Describe your situation first' }, { status: 400 });
  }

  const result = match(q);

  return Response.json({
    query: result.query,
    matchedTags: result.matchedTags,
    minds: result.minds.map(({ mind, score, why }) => ({
      slug: mind.slug,
      name: mind.name,
      headline: mind.headline,
      city: mind.city,
      languages: mind.languages,
      score: Math.round(score * 10) / 10,
      why,
    })),
    panels: result.panels.map(({ panel }) => ({ slug: panel.slug, title: panel.title })),
    questions: result.questions.map((q2) => ({ slug: q2.slug, title: q2.title })),
  });
}
