import { minds, panels, questions, getMind } from '@/data';
import type { Mind, Panel, Question } from '@/data/types';

/**
 * India-specific synonym lexicon. The left side is what people actually type
 * (including Hinglish and abbreviations); the right side is canonical tags
 * that appear on minds and questions.
 *
 * This is deliberately hand-written rather than embedding-based: at this size
 * it is more accurate, it is debuggable, and it costs nothing per query.
 * Swap in pgvector search once there are a few hundred minds (see README).
 */
const LEXICON: Record<string, string[]> = {
  // Exams & government
  upsc: ['upsc', 'civil services'], ias: ['upsc', 'ias'], ips: ['upsc', 'ips'],
  cse: ['upsc'], prelims: ['upsc', 'prelims'], mains: ['upsc', 'mains'],
  'civil services': ['upsc'], 'optional subject': ['upsc', 'optional'],
  attempt: ['attempt'], 'drop year': ['drop year'], coaching: ['coaching'],
  'rajinder nagar': ['coaching', 'upsc'], 'mukherjee nagar': ['coaching', 'upsc'],
  'sarkari naukri': ['government job vs private'], psu: ['psu'], pension: ['pension'],
  'government job': ['government job vs private'], 'govt job': ['government job vs private'],
  'bank po': ['government job vs private'], ssc: ['government job vs private'],

  // Jobs, money at work
  ctc: ['ctc', 'salary negotiation'], 'in hand': ['ctc'], 'take home': ['ctc'],
  lpa: ['ctc', 'salary negotiation', 'offer letter'], package: ['ctc', 'salary negotiation'],
  mnc: ['job switch', 'offer letter'], joining: ['offer letter'],
  salary: ['salary negotiation', 'ctc'], hike: ['hike', 'appraisal'],
  appraisal: ['appraisal'], negotiate: ['salary negotiation'],
  offer: ['offer letter', 'salary negotiation'], 'offer letter': ['offer letter'],
  'notice period': ['notice period'], 'counter offer': ['counter offer'],
  hr: ['hr round'], bgv: ['bgv'], variable: ['variable pay'],
  esop: ['esop', 'equity'], esops: ['esop', 'equity'], equity: ['esop', 'equity'],
  vesting: ['vesting', 'esop'], cliff: ['cliff', 'esop'], buyback: ['buyback', 'esop'],
  'strike price': ['strike price', 'esop'], 'stock options': ['esop'],
  switch: ['job switch'], resign: ['job switch'], pip: ['pip'],

  // Layoffs
  layoff: ['layoff'], 'laid off': ['layoff'], 'let go': ['layoff'],
  fired: ['layoff'], severance: ['severance'], 'job loss': ['layoff'],
  unemployed: ['layoff', 'job search'], 'no job': ['layoff', 'job search'],

  // Abroad
  ms: ['ms in us', 'masters abroad'], 'masters abroad': ['masters abroad'],
  gre: ['gre', 'ms in us'], ielts: ['masters abroad'], toefl: ['masters abroad'],
  'study abroad': ['study abroad'], 'education loan': ['education loan'],
  'student loan': ['education loan'], f1: ['f1 visa'], opt: ['opt'],
  h1b: ['h1b'], 'h-1b': ['h1b'], 'green card': ['green card'],
  'priority date': ['priority date', 'green card'], eb2: ['eb2', 'green card'],
  eb3: ['eb3', 'green card'], visa: ['visa'], 'canada pr': ['canada pr'],
  germany: ['germany'], 'moving back': ['moving back to india'],
  r2i: ['moving back to india'], nri: ['nri'], 'return to india': ['return to india'],
  'reverse migration': ['reverse migration'], gcc: ['gcc'],

  // Startups
  startup: ['india startup'], founder: ['founder'],
  'seed round': ['seed round', 'fundraising'], 'seed stage': ['seed round'],
  'joining a startup': ['joining a startup', 'esop', 'startup salary'],
  fundraising: ['fundraising'], raise: ['fundraising'], vc: ['vc'],
  'term sheet': ['term sheet'], safe: ['safe note'], ccps: ['ccps'],
  valuation: ['valuation'], dilution: ['dilution'], 'cap table': ['cap table'],
  runway: ['runway'], burn: ['burn'], 'shut down': ['shutting down'],
  shutting: ['shutting down'], 'wind up': ['winding up'], 'winding up': ['winding up'],
  'strike off': ['strike off'], cofounder: ['cofounder conflict'],
  'co-founder': ['cofounder conflict'], d2c: ['d2c'], cac: ['cac'],

  // Money
  emi: ['emi', 'home loan'], 'home loan': ['home loan'], loan: ['home loan'],
  rent: ['rent vs buy'], buy: ['rent vs buy'], 'rent or buy': ['rent vs buy'],
  flat: ['flat', 'property'], property: ['property'], rera: ['rera'],
  'stamp duty': ['stamp duty'], 'down payment': ['down payment'],
  prepay: ['prepayment'], prepayment: ['prepayment'],
  sip: ['sip', 'mutual funds'], 'mutual fund': ['mutual funds'],
  'index fund': ['index fund'], ppf: ['ppf'], nps: ['nps'], elss: ['elss'],
  lic: ['lic'], ulip: ['ulip'], endowment: ['endowment policy'],
  'term insurance': ['term insurance'], 'health insurance': ['health insurance'],
  'emergency fund': ['emergency fund'], fd: ['fd'], gold: ['gold'],
  '80c': ['80c'], 'tax regime': ['old vs new tax regime'],
  savings: ['personal finance'], invest: ['investing', 'personal finance'],

  // Family
  shaadi: ['arranged marriage', 'marriage pressure'],
  marriage: ['marriage pressure'], rishta: ['rishta', 'arranged marriage'],
  'arranged marriage': ['arranged marriage'], 'love marriage': ['love marriage'],
  'inter caste': ['inter caste'], 'intercaste': ['inter caste'],
  'inter faith': ['inter faith marriage'], interfaith: ['inter faith marriage'],
  'court marriage': ['court marriage', 'special marriage act'],
  'special marriage act': ['special marriage act'],
  parents: ['parents'], papa: ['parents'], mummy: ['parents'],
  'in laws': ['in laws'], ghar: ['parents', 'moving out'],
  'moving out': ['moving out'], 'living alone': ['living alone'],
  pg: ['pg'], flatmate: ['flatmate'], landlord: ['landlord'],
  deposit: ['security deposit'], broker: ['broker'],
  'elder care': ['elder care'], 'ageing parents': ['ageing parents'],
  'old parents': ['ageing parents'], caregiving: ['caregiving'],
  'career break': ['career break'], maternity: ['maternity'],
  creche: ['creche', 'childcare'], childcare: ['childcare'],
  'back to work': ['return to work'],

  // Freelance & business
  freelance: ['freelancing'], freelancing: ['freelancing'],
  gst: ['gst'], lut: ['lut'], 'export of services': ['export of services'],
  firc: ['firc'], proprietorship: ['proprietorship'],
  'pvt ltd': ['pvt ltd'], 'private limited': ['pvt ltd'],
  llp: ['pvt ltd'], tds: ['tds'], roc: ['roc'],
  'advance tax': ['advance tax'], invoice: ['invoice'],
  msme: ['msme'], udyam: ['udyam'], 'working capital': ['working capital'],
  payroll: ['payroll'], 'late payment': ['working capital'],
  ca: ['ca'], usd: ['usd'], dollars: ['usd'], wise: ['wise'], payoneer: ['payoneer'],

  // First-gen / moving / confidence
  'first generation': ['first generation'], 'first gen': ['first generation'],
  'small town': ['small town'], 'tier 2': ['small town'], 'tier 3': ['tier 3'],
  english: ['english'], accent: ['accent'],
  'imposter syndrome': ['imposter syndrome'], confidence: ['confidence'],
  'new city': ['new city', 'relocation'], relocate: ['relocation'],
  'moving city': ['relocation'], hostel: ['hostel'],
  burnout: ['burnout'], 'work life balance': ['work life balance'],
};

const STOPWORDS = new Set([
  'i','me','my','we','our','you','your','a','an','the','and','or','but','if','is','am','are','was','were','be','been',
  'to','of','in','on','at','for','with','about','from','should','would','could','do','does','did','not','no','so','it',
  'this','that','these','those','what','how','why','when','which','who','can','will','just','have','has','had','get',
  'got','want','need','think','feel','like','really','very','much','more','than','then','now','also','there','their',
  'them','he','she','they','his','her','one','two','year','years','month','months','old','new','out','up','down','into',
]);

export type MatchResult = {
  query: string;
  minds: { mind: Mind; score: number; why: string[] }[];
  panels: { panel: Panel; score: number }[];
  questions: Question[];
  matchedTags: string[];
};

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[₹$]/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Pull canonical tags out of free text using the lexicon (longest phrase first). */
export function extractTags(text: string): string[] {
  const norm = normalise(text);
  const hits = new Set<string>();

  const phrases = Object.keys(LEXICON).sort((a, b) => b.length - a.length);
  for (const phrase of phrases) {
    const pattern = new RegExp(`(^|\\s)${phrase.replace(/[-]/g, '[- ]')}(s)?($|\\s)`);
    if (pattern.test(norm)) {
      for (const tag of LEXICON[phrase]) hits.add(tag);
    }
  }
  return [...hits];
}

function contentWords(text: string): string[] {
  return normalise(text)
    .split(' ')
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

export function match(query: string, limit = 6): MatchResult {
  const matchedTags = extractTags(query);
  const words = contentWords(query);
  const tagSet = new Set(matchedTags);

  const scored = minds.map((mind) => {
    const why: string[] = [];
    let score = 0;

    for (const tag of mind.tags) {
      if (tagSet.has(tag)) {
        score += 6;
        why.push(tag);
      }
    }

    // Category signal: a matched tag that also names one of their categories.
    for (const cat of mind.categories) {
      if (tagSet.has(cat)) score += 2;
    }

    // Loose text overlap against the situation they lived through.
    const haystack = normalise(
      [mind.headline, mind.livedIt.join(' '), mind.bio, mind.tags.join(' ')].join(' '),
    );
    for (const word of words) {
      if (haystack.includes(word)) score += 1;
    }

    // Tiny tiebreaker so popular minds surface first among equal matches.
    score += Math.min(mind.responses / 1000, 0.9);

    return { mind, score, why: [...new Set(why)].slice(0, 4) };
  });

  const ranked = scored
    .filter((s) => s.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Panels inherit the scores of their members.
  const panelScores = panels
    .map((panel) => {
      const total = panel.minds.reduce((sum, slug) => {
        const hit = scored.find((s) => s.mind.slug === slug);
        return sum + (hit && hit.score >= 2 ? hit.score : 0);
      }, 0);
      return { panel, score: total / Math.max(panel.minds.length, 1) };
    })
    .filter((p) => p.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const relatedQuestions = questions
    .map((q) => ({ q, hits: q.tags.filter((t) => tagSet.has(t)).length }))
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 4)
    .map((x) => x.q);

  return { query, minds: ranked, panels: panelScores, questions: relatedQuestions, matchedTags };
}

/** Fallback for an empty or unmatched situation: the broadest, busiest minds. */
export function fallbackMinds(limit = 6): Mind[] {
  return [...minds].sort((a, b) => b.responses - a.responses).slice(0, limit);
}

export { getMind };
