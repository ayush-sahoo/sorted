export type Mind = {
  slug: string;
  name: string;
  /** One line: the situation they lived through, not a job title. */
  headline: string;
  city: string;
  languages: string[];
  categories: string[];
  /** Match keys. Keep these lowercase and India-flavoured. */
  tags: string[];
  /** Hard credentials for *this situation* — what makes them worth asking. */
  livedIt: string[];
  bio: string;
  /** How they talk. Fed to the model as voice guidance. */
  voice: string;
  /** The uncomfortable question they will put back to you. */
  pushesOn: string;
  perspectives: { q: string; a: string }[];
  panels: string[];
  responses: number;
  /** Seed data is a composite, not a real person. Surfaced in the UI. */
  composite: true;
};

export type Panel = {
  slug: string;
  title: string;
  /** "Ask people who've…" */
  subtitle: string;
  category: string;
  minds: string[];
};

export type Question = {
  slug: string;
  title: string;
  context: string;
  category: string;
  tags: string[];
  answers: { mind: string; take: string }[];
};

export type Category = { slug: string; label: string };
