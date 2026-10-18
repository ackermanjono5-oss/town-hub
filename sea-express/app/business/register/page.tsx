'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/client';
import { getMyProfile } from '@/lib/rewards/queries';
import { registerBusiness } from '@/lib/business/queries';

type CheckState = 'loading' | 'signed-out' | 'already-business' | 'ready';

export default function BusinessRegisterPage() {
  const router = useRouter();
  const [checkState, setCheckState] = useState<CheckState>('loading');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      // getCurrentUser reads the stored session. getUser() revalidates
      // against the Auth server, so offline — the normal state for this
      // app — it never settles and the gate sits on its loading state.
      const user = await getCurrentUser();
      if (!user) {
        if (!cancelled) setCheckState('signed-out');
        return;
      }
      const profile = await getMyProfile(user.id);
      if (cancelled) return;
      setCheckState(profile?.role === 'business_owner' ? 'already-business' : 'ready');
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await registerBusiness({ name, category: category || undefined, description: description || undefined });
      router.push('/business');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register business.');
    } finally {
      setSubmitting(false);
    }
  }

  if (checkState === 'loading') {
    return <p className="text-sm text-muted-foreground text-center py-12">Loading…</p>;
  }

  if (checkState === 'signed-out') {
    return (
      <div className="max-w-sm mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground mb-4">Sign in first to register your business.</p>
        <a
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
        >
          Sign In
        </a>
      </div>
    );
  }

  if (checkState === 'already-business') {
    return (
      <div className="max-w-sm mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground mb-4">This account is already linked to a business.</p>
        <a
          href="/business"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
        >
          Go to Business Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Register Your Business</h1>
        <p className="text-muted-foreground">
          List your local business and offer rewards to Town Hub members. We&rsquo;ll review your submission before
          it goes live.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Business name
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            Category
          </label>
          <input
            id="category"
            placeholder="e.g. Restaurant, Retail, Services"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition"
        >
          {submitting ? 'Submitting…' : 'Submit for Review'}
        </button>
      </form>
    </div>
  );
}
