'use client';

import { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function Chat({
  mindSlug,
  mindName,
  starters,
  prefill,
}: {
  mindSlug: string;
  mindName: string;
  starters: string[];
  prefill?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState(prefill ?? '');
  const [streaming, setStreaming] = useState(false);
  const [mode, setMode] = useState<'live' | 'offline' | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streaming]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || streaming) return;

    const next: Msg[] = [...messages, { role: 'user', content: question }];
    setMessages(next);
    setDraft('');
    setStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mind: mindSlug, messages: next }),
      });

      const headerMode = res.headers.get('X-Sorted-Mode');
      if (headerMode === 'live' || headerMode === 'offline') setMode(headerMode);

      if (!res.ok || !res.body) {
        throw new Error(await res.text().catch(() => 'Request failed'));
      }

      setMessages([...next, { role: 'assistant', content: '' }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...next, { role: 'assistant', content: acc }]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setMessages([...next, { role: 'assistant', content: `[${message}]` }]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="chat">
      <div className="chat-head">
        <Avatar name={mindName} slug={mindSlug} size="sm" />
        <span>Talking to {mindName}</span>
        {mode && (
          <span className={mode === 'live' ? 'mode-pill' : 'mode-pill offline'}>
            {mode === 'live' ? 'live' : 'stored answers'}
          </span>
        )}
      </div>

      <div className="chat-log" ref={logRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            <p style={{ marginTop: 0 }}>Ask about the situation they actually lived through:</p>
            <div className="examples" style={{ marginTop: 10 }}>
              {starters.map((s) => (
                <button key={s} className="chip" type="button" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'msg user' : 'msg mind'}>
            {m.role === 'assistant' && <Avatar name={mindName} slug={mindSlug} size="sm" />}
            <div
              className={
                streaming && i === messages.length - 1 && m.role === 'assistant'
                  ? 'bubble typing'
                  : 'bubble'
              }
            >
              {m.content}
            </div>
          </div>
        ))}

        {streaming && messages[messages.length - 1]?.role === 'user' && (
          <div className="msg mind">
            <Avatar name={mindName} slug={mindSlug} size="sm" />
            <div className="bubble typing" />
          </div>
        )}
      </div>

      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Ask ${mindName.split(' ')[0]} about your situation…`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(draft);
            }
          }}
        />
        <button className="btn" type="submit" disabled={!draft.trim() || streaming}>
          {streaming ? 'Replying…' : 'Ask'}
        </button>
      </form>
    </div>
  );
}
