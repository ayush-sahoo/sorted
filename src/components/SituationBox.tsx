'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

const EXAMPLES = [
  'Parents want me to give UPSC one more attempt. I am 26.',
  '₹18 LPA at an MNC or ₹9 LPA + ESOPs at a seed startup?',
  'Should I take a ₹55 lakh loan for an MS in the US?',
  'I was laid off on Monday and I have an EMI.',
  'Rent in Powai or buy in Thane?',
  'I want to move out but my parents are against it.',
];

export default function SituationBox({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(text: string) {
    const q = text.trim();
    if (!q) return;
    startTransition(() => {
      router.push(`/situation?q=${encodeURIComponent(q)}`);
    });
  }

  return (
    <>
      <form
        className="ask"
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
      >
        <label htmlFor="situation" className="sr-only" style={{ position: 'absolute', left: -9999 }}>
          Describe your situation
        </label>
        <textarea
          id="situation"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Describe your situation. The more specific, the better — city, numbers, who else is involved."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit(value);
            }
          }}
        />
        <div className="ask-foot">
          <span className="hint">Nothing you type is shared with other users.</span>
          <button className="btn" type="submit" disabled={!value.trim() || pending}>
            {pending ? 'Finding people…' : 'Find people who’ve been there'}
          </button>
        </div>
      </form>

      <div className="examples">
        {EXAMPLES.map((ex) => (
          <button key={ex} type="button" className="chip" onClick={() => submit(ex)}>
            {ex}
          </button>
        ))}
      </div>
    </>
  );
}
