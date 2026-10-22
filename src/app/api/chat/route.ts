import { getMind } from '@/data';
import { streamAnswer, isLive, type Turn } from '@/lib/claude';

export const runtime = 'nodejs';
export const maxDuration = 60;

type Body = { mind?: string; messages?: Turn[] };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  const mind = body.mind ? getMind(body.mind) : undefined;
  if (!mind) {
    return new Response('Unknown mind', { status: 404 });
  }

  const history = (body.messages ?? [])
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
    .slice(-12);

  if (history.length === 0 || history[history.length - 1].role !== 'user') {
    return new Response('Last message must be from the user', { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await streamAnswer(mind, history, (text) => {
          controller.enqueue(encoder.encode(text));
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Something went wrong generating that answer.';
        controller.enqueue(encoder.encode(`\n\n[${message}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Sorted-Mode': isLive() ? 'live' : 'offline',
    },
  });
}
