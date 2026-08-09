'use client';

import { useState } from 'react';
import { Ticket, Sparkles, Copy, Check } from 'lucide-react';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode(): string {
  let code = '';
  for (let i = 0; i < 8; i += 1) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    if (i === 3) code += '-';
  }
  return `THD-${code}`;
}

export default function CouponSection() {
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const getCode = () => {
    setCode(generateCode());
    setCopied(false);
  };

  const copyCode = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-12 p-6 rounded-xl border border-border bg-background text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Ticket className="w-5 h-5 text-primary" aria-hidden="true" />
        <h2 className="text-lg font-bold">Get Your Coupon Code</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Tap the button for a random discount code — try again anytime for a new one.
      </p>

      {code && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider px-4 py-2 rounded-lg bg-primary/10 text-primary">
            {code}
          </span>
          <button
            type="button"
            onClick={copyCode}
            aria-label="Copy coupon code"
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-secondary transition"
          >
            {copied ? (
              <Check className="w-4 h-4 text-primary" aria-hidden="true" />
            ) : (
              <Copy className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={getCode}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
      >
        <Sparkles className="w-4 h-4" aria-hidden="true" />
        {code ? 'Get Another Code' : 'Get Coupon Code'}
      </button>

      <p className="text-xs text-muted-foreground mt-4">
        Install our other app, <strong>Town Hub Discounts</strong>, enter your code
        and get discounts at participating local businesses.
      </p>
    </div>
  );
}
