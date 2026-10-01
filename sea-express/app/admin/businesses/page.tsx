'use client';

import { useEffect, useState } from 'react';
import { approveBusiness, createBusiness, generateRegistrationCode, listBusinesses } from '@/lib/admin/queries';
import type { BusinessWithOwner } from '@/lib/admin/types';

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessWithOwner[] | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeByBusiness, setCodeByBusiness] = useState<Record<string, string>>({});

  async function refresh() {
    setBusinesses(await listBusinesses());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createBusiness({ name, description: description || undefined, category: category || undefined });
      setName('');
      setDescription('');
      setCategory('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create business.');
    } finally {
      setCreating(false);
    }
  }

  async function handleGenerateCode(businessId: string, businessName: string) {
    try {
      const code = await generateRegistrationCode(businessId, businessName);
      setCodeByBusiness((prev) => ({ ...prev, [businessId]: code }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate code.');
    }
  }

  async function handleApprove(businessId: string) {
    try {
      await approveBusiness(businessId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve business.');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Businesses</h1>
        <p className="text-muted-foreground">Create a business, then generate a registration code for its owner.</p>
      </div>

      <form onSubmit={handleCreate} className="p-4 rounded-lg border border-border bg-background space-y-3">
        <p className="font-semibold text-sm">Create business</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            required
            placeholder="Business name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            placeholder="Category (optional)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition"
        >
          {creating ? 'Creating…' : 'Create business'}
        </button>
      </form>

      <div className="space-y-3">
        {businesses === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : businesses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No businesses yet.</p>
        ) : (
          businesses.map((business) => (
            <div key={business.id} className="p-4 rounded-lg border border-border bg-background flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{business.name}</p>
                <p className="text-sm text-muted-foreground">
                  {business.owner?.full_name ?? 'Unclaimed'} · {business.category ?? 'Uncategorized'}
                  {!business.is_active && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground">
                      Pending approval
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right shrink-0 flex items-center gap-2">
                {!business.is_active && business.owner && (
                  <button
                    type="button"
                    onClick={() => handleApprove(business.id)}
                    className="px-3 py-1.5 rounded-full text-sm bg-primary text-primary-foreground hover:opacity-90 transition"
                  >
                    Approve
                  </button>
                )}
                {codeByBusiness[business.id] ? (
                  <code className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-sm font-mono">
                    {codeByBusiness[business.id]}
                  </code>
                ) : (
                  !business.owner && (
                    <button
                      type="button"
                      onClick={() => handleGenerateCode(business.id, business.name)}
                      className="px-3 py-1.5 rounded-full text-sm border border-border hover:bg-secondary transition"
                    >
                      Generate Code
                    </button>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
