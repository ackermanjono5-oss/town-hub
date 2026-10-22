'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { listMembers, setMembership } from '@/lib/admin/queries';
import type { AdminMemberRow } from '@/lib/admin/types';
import { getTownLabel } from '@/lib/garden-route/towns';
import { formatDateTime } from '@/lib/rewards/voucher';

export default function AdminMembersPage() {
  const [members, setMembers] = useState<AdminMemberRow[] | null>(null);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (query: string) => {
    setError(null);
    try {
      setMembers(await listMembers(query));
    } catch (err) {
      setMembers([]);
      setError(
        err instanceof Error && /admin_list_members/.test(err.message)
          ? 'The Members feature needs migration 0012 applied in Supabase.'
          : err instanceof Error
            ? err.message
            : 'Could not load members.'
      );
    }
  }, []);

  // Search as the admin types, after a short pause.
  useEffect(() => {
    const timer = setTimeout(() => refresh(search), 300);
    return () => clearTimeout(timer);
  }, [search, refresh]);

  async function toggle(member: AdminMemberRow) {
    setBusyId(member.id);
    setError(null);
    try {
      await setMembership(member.id, !member.is_subscribed);
      setMembers((list) =>
        (list ?? []).map((m) => (m.id === member.id ? { ...m, is_subscribed: !m.is_subscribed } : m))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change membership.');
    } finally {
      setBusyId(null);
    }
  }

  const activeCount = (members ?? []).filter((m) => m.is_subscribed).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Members</h1>
        <p className="text-muted-foreground">
          Switch a member&rsquo;s rewards membership on or off. Only members with an active
          membership can see and redeem rewards.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone"
          className="w-full pl-9 pr-3 py-2.5 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {members === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-muted-foreground">{search ? 'No members match that search.' : 'No members yet.'}</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {members.length} shown · {activeCount} with active membership
          </p>
          <ul className="divide-y divide-border rounded-lg border border-border bg-background">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {m.full_name || 'No name'}
                    {m.role !== 'customer' && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-secondary text-secondary-foreground capitalize">
                        {m.role.replace('_', ' ')}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {[m.email, m.phone, m.home_town ? getTownLabel(m.home_town) : null].filter(Boolean).join(' · ')}
                  </p>
                  <p className="text-xs text-muted-foreground">Joined {formatDateTime(m.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(m)}
                  disabled={busyId === m.id}
                  aria-pressed={m.is_subscribed}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition disabled:opacity-60 ${
                    m.is_subscribed ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {busyId === m.id ? 'Saving…' : m.is_subscribed ? 'Member' : 'Not a member'}
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Tap the button to switch. Members also need a name and phone number on their profile
            before they can get a voucher.
          </p>
        </>
      )}
    </div>
  );
}
