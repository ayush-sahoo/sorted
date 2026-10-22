import { minds } from './minds';
import { panels } from './panels';
import { questions } from './questions';
import { categories } from './categories';
import type { Mind, Panel, Question } from './types';

export { minds, panels, questions, categories };
export type { Mind, Panel, Question };

const mindBySlug = new Map(minds.map((m) => [m.slug, m]));

export function getMind(slug: string): Mind | undefined {
  return mindBySlug.get(slug);
}

export function getMinds(slugs: string[]): Mind[] {
  return slugs.map((s) => mindBySlug.get(s)).filter((m): m is Mind => Boolean(m));
}

export function getPanel(slug: string): Panel | undefined {
  return panels.find((p) => p.slug === slug);
}

export function getQuestion(slug: string): Question | undefined {
  return questions.find((q) => q.slug === slug);
}

/** Panels are the source of truth for membership. */
export function panelsForMind(slug: string): Panel[] {
  return panels.filter((p) => p.minds.includes(slug));
}

export function questionsForMind(slug: string): Question[] {
  return questions.filter((q) => q.answers.some((a) => a.mind === slug));
}

export function mindsInCategory(category: string): Mind[] {
  if (category === 'all') return minds;
  return minds.filter((m) => m.categories.includes(category));
}

export function categoryLabel(slug: string): string {
  return categories.find((c) => c.slug === slug)?.label ?? slug;
}
