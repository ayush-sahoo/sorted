import Anthropic from '@anthropic-ai/sdk';
import type { Mind } from '@/data/types';
import { systemPromptFor, closestPerspective } from './persona';

const MODEL = process.env.SORTED_MODEL ?? 'claude-opus-5-5';
const EFFORT = (process.env.SORTED_EFFORT ?? 'low') as 'low' | 'medium' | 'high';

export function isLive(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export type Turn = { role: 'user' | 'assistant'; content: string };

/**
 * Streams a persona answer as plain text chunks.
 *
 * With ANTHROPIC_API_KEY set, this generates a fresh answer in the mind's
 * voice. Without it, the app stays fully usable: it serves the mind's closest
 * stored perspective, streamed the same way, so the UI is identical.
 */
export async function streamAnswer(
  mind: Mind,
  history: Turn[],
  onChunk: (text: string) => void,
): Promise<void> {
  const question = [...history].reverse().find((t) => t.role === 'user')?.content ?? '';

  if (!isLive()) {
    const stored = closestPerspective(mind, question);
    const preamble =
      history.filter((t) => t.role === 'user').length > 1
        ? `Coming back to what you asked — `
        : '';
    await fakeStream(preamble + stored.a, onChunk);
    return;
  }

  const client = new Anthropic();

  // Claude Opus 5.5: thinking is always on, so `thinking` is omitted and depth
  // is controlled with output_config.effort. Low effort keeps chat snappy.
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 2000,
    system: [
      {
        type: 'text',
        text: systemPromptFor(mind),
        cache_control: { type: 'ephemeral' },
      },
    ],
    output_config: { effort: EFFORT },
    messages: history.map((t) => ({ role: t.role, content: t.content })),
  });

  stream.on('text', (text) => onChunk(text));

  const final = await stream.finalMessage();

  if (final.stop_reason === 'refusal') {
    onChunk(
      '\n\nI am not able to answer that one. Try asking me about the part of this I have actually lived through.',
    );
  }
}

/** Streams stored text at a readable pace so offline mode feels like the live one. */
async function fakeStream(text: string, onChunk: (t: string) => void): Promise<void> {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i += 3) {
    onChunk(words.slice(i, i + 3).join(' ') + (i + 3 < words.length ? ' ' : ''));
    await new Promise((r) => setTimeout(r, 24));
  }
}
