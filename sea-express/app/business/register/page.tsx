'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { getCurrentUser, isSupabaseConfigured } from '@/lib/supabase/client';
import SupabaseSetupNotice from '@/components/SupabaseSetupNotice';
import { TOWNS } from '@/lib/garden-route/towns';
import { getMyBusiness, registerBusiness, updateBusinessDetails } from '@/lib/business/queries';
import { navigateTo } from '@/lib/app-nav';
import type { RegisterBusinessInput } from '@/lib/business/types';
import type { Business } from '@/lib/rewards/types';
import type { DirectoryListing } from '@/lib/business/directory-listings';

type CheckState = 'loading' | 'signed-out' | 'new' | 'edit';

const INPUT =
  'w-full px-3 py-2.5 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60';

const EMPTY: RegisterBusinessInput = {
  registered_name: '',
  trading_name: '',
  registration_number: '',
  directory_listing_id: '',
  category: '',
  description: '',
  contact_name: '',
  phone: '',
  email: '',
  address: '',
  town: '',
  advertising_reference: '',
  accept_terms: false,
};

function fromBusiness(b: Business): RegisterBusinessInput {
  return {
    registered_name: b.registered_name ?? b.name,
    trading_name: b.trading_name ?? '',
    registration_number: b.registration_number ?? '',
    directory_listing_id: b.directory_listing_id ?? '',
    category: b.category ?? '',
    description: b.description ?? '',
    contact_name: b.contact_name ?? '',
    phone: b.phone ?? '',
    email: b.email ?? '',
    address: b.address ?? '',
    town: b.town ?? '',
    advertising_reference: b.advertising_reference ?? '',
    accept_terms: Boolean(b.terms_accepted_at),
  };
}

export default function RegisterBusinessPage() {
  const [checkState, setCheckState] = useState<CheckState>('loading');
  const [existing, setExisting] = useState<Business | null>(null);
  const [form, setForm] = useState<RegisterBusinessInput>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    async function check() {
      const user = await getCurrentUser();
      if (!user) {
        if (!cancelled) setCheckState('signed-out');
        return;
      }
      const business = await getMyBusiness(user.id);
      if (cancelled) return;
      if (business) {
        setExisting(business);
        setForm(fromBusiness(business));
        setCheckState('edit');
      } else {
        setCheckState('new');
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  function set<K extends keyof RegisterBusinessInput>(key: K, value: RegisterBusinessInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (existing) {
        const trim = (v?: string) => (v && v.trim() ? v.trim() : null);
        await updateBusinessDetails(existing.id, {
          registered_name: form.registered_name.trim(),
          trading_name: trim(form.trading_name),
          category: trim(form.category),
          description: trim(form.description),
          contact_name: form.contact_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: trim(form.address),
          town: trim(form.town),
          advertising_reference: trim(form.advertising_reference),
          directory_listing_id: trim(form.directory_listing_id),
        });
        setSaved(true);
      } else {
        await registerBusiness(form);
        navigateTo('/business');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <a
        href="/business"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Business Rewards Portal
      </a>

      {!isSupabaseConfigured ? (
        <SupabaseSetupNotice feature="business registration" />
      ) : checkState === 'loading' ? (
        <p className="text-sm text-muted-foreground text-center py-12">Checking your account…</p>
      ) : checkState === 'signed-out' ? (
        <div className="text-center py-12 space-y-4">
          <p className="text-muted-foreground">
            Sign in with your Town Hub account first. The person who registers becomes the
            business&rsquo;s owner account in the Business Rewards Portal.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-sm hover:brightness-110 transition"
          >
            Sign In
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {existing ? 'Your business registration' : 'Register your business for loyalty rewards'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {existing
                ? 'Keep your details up to date. Town Hub reviews every registration.'
                : 'For registered companies that advertise with Town Hub. All fields marked * are required. Town Hub reviews every application before rewards access is activated.'}
            </p>
          </div>

          <Section title="Company">
            <Field label="Registered company name *">
              <input required value={form.registered_name} onChange={(e) => set('registered_name', e.target.value)} className={INPUT} />
            </Field>
            <Field label="Trading name" hint="The name customers know you by, if different.">
              <input value={form.trading_name} onChange={(e) => set('trading_name', e.target.value)} className={INPUT} />
            </Field>
            <Field
              label="Company registration number *"
              hint={existing ? 'Contact Town Hub to change this.' : 'Your CIPC number, e.g. 2016/350606/07.'}
            >
              <input
                required
                disabled={Boolean(existing)}
                value={form.registration_number}
                onChange={(e) => set('registration_number', e.target.value)}
                className={INPUT}
              />
            </Field>
            <Field label="Business category">
              <input
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                placeholder="e.g. Restaurant, Retail, Services"
                className={INPUT}
              />
            </Field>
            <Field label="Short description">
              <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className={INPUT} />
            </Field>
            <DirectoryPicker value={form.directory_listing_id ?? ''} onChange={(id) => set('directory_listing_id', id)} />
          </Section>

          <Section title="Contact">
            <Field label="Contact person *">
              <input required value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} className={INPUT} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Business telephone *">
                <input required type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={INPUT} />
              </Field>
              <Field label="Business email *">
                <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={INPUT} />
              </Field>
            </div>
            <Field label="Physical address">
              <input value={form.address} onChange={(e) => set('address', e.target.value)} className={INPUT} />
            </Field>
            <Field label="Town">
              <select value={form.town} onChange={(e) => set('town', e.target.value)} className={INPUT}>
                <option value="">Select a town</option>
                {TOWNS.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="Town Hub advertising">
            <Field
              label="Advertising account or subscription reference"
              hint="Rewards are for paying Town Hub advertisers. Not advertising yet? Leave this blank — Town Hub will contact you about an advertising subscription."
            >
              <input value={form.advertising_reference} onChange={(e) => set('advertising_reference', e.target.value)} className={INPUT} />
            </Field>
          </Section>

          {!existing && (
            <Section title="Programme terms">
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>Only approved businesses with an active Town Hub advertising subscription may offer rewards.</li>
                <li>Town Hub approves, schedules and may deactivate every reward offer.</li>
                <li>You must honour every valid voucher for your approved offers, on the terms shown when it was issued.</li>
                <li>Vouchers are verified and redeemed only through the Business Rewards Portal.</li>
                <li>Town Hub may suspend rewards access if your subscription lapses or the terms are breached.</li>
              </ul>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  required
                  checked={form.accept_terms}
                  onChange={(e) => set('accept_terms', e.target.checked)}
                  className="mt-0.5"
                />
                <span>I accept the Town Hub loyalty rewards programme terms and conditions *</span>
              </label>
            </Section>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}
          {saved && <p className="text-sm text-primary">Saved.</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-sm hover:brightness-110 transition disabled:opacity-60"
          >
            {submitting ? 'Saving…' : existing ? 'Save details' : 'Submit registration'}
          </button>
        </form>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 p-4 rounded-xl border border-border bg-background">
      <legend className="px-1 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

/**
 * Links the registration to the business's existing Town Hub directory
 * listing. The directory data is loaded on first use — it's every listing
 * in the app, which no other portal screen needs.
 */
function DirectoryPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [mod, setMod] = useState<typeof import('@/lib/business/directory-listings') | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (value && !mod) import('@/lib/business/directory-listings').then(setMod);
  }, [value, mod]);

  const selected = mod?.findDirectoryListing(value);
  const results: DirectoryListing[] = mod ? mod.searchDirectoryListings(query) : [];

  if (value) {
    return (
      <div className="space-y-1">
        <span className="text-sm font-medium">Town Hub directory listing</span>
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-md border border-border bg-secondary/40">
          <span className="text-sm">
            {selected ? (
              <>
                <strong>{selected.name}</strong> · {selected.townLabel} · {selected.kind}
              </>
            ) : (
              value
            )}
          </span>
          <button type="button" onClick={() => onChange('')} aria-label="Remove directory listing">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <span className="text-sm font-medium">Town Hub directory listing</span>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <input
          value={query}
          onFocus={() => {
            if (!mod) import('@/lib/business/directory-listings').then(setMod);
          }}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for your business in the Town Hub directory"
          className={`${INPUT} pl-9`}
        />
      </div>
      {results.length > 0 && (
        <ul className="rounded-md border border-border bg-background divide-y divide-border max-h-64 overflow-auto">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(r.id);
                  setQuery('');
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-secondary"
              >
                <strong>{r.name}</strong> <span className="text-muted-foreground">· {r.townLabel} · {r.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <span className="block text-xs text-muted-foreground">
        Links your rewards to your existing listing. Not listed? Leave this blank.
      </span>
    </div>
  );
}
