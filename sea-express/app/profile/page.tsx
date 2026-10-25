'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BadgeCheck,
  Building2,
  Check,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Camera,
  ImagePlus,
  Shield,
  Sparkles,
  Trash2,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { getCurrentUser, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import SupabaseSetupNotice from '@/components/SupabaseSetupNotice';
import Avatar, { AVATARS } from '@/components/Avatar';
import {
  cachedPhoto,
  clearCachedPhoto,
  removeAvatarPhoto,
  uploadAvatarPhoto,
} from '@/lib/profile/avatar-photo';
import { getMyProfile, updateMyProfile, type ProfilePatch } from '@/lib/rewards/queries';
import { TOWNS, getTownLabel } from '@/lib/garden-route/towns';
import type { Profile, ProfileRole } from '@/lib/rewards/types';

const ROLE_LABEL: Record<ProfileRole, string> = {
  customer: 'Member',
  business_owner: 'Business owner',
  employee: 'Staff',
  admin: 'Administrator',
};

const ROLE_ICON: Record<ProfileRole, LucideIcon> = {
  customer: UserRound,
  business_owner: Building2,
  employee: BadgeCheck,
  admin: Shield,
};

type View = 'loading' | 'signed-out' | 'ready';

function joinedLabel(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
}

export default function ProfilePage() {
  const [view, setView] = useState<View>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [town, setTown] = useState('');
  const [phone, setPhone] = useState('');

  const [picking, setPicking] = useState(false);
  /** Local copy of the uploaded photo — see lib/profile/avatar-photo.ts. */
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const supabase = getSupabaseClient();

  const load = useCallback(async () => {
    const user = await getCurrentUser();
    if (!user) {
      setView('signed-out');
      return;
    }
    setEmail(user.email ?? '');
    // Prefer the cached copy: avatar_url is https and will not load from
    // file:// without a connection.
    setPhoto(cachedPhoto(user.id));
    const p = await getMyProfile(user.id);
    setProfile(p);
    setName(p?.full_name ?? '');
    setTown(p?.home_town ?? '');
    setPhone(p?.phone ?? '');
    if (!cachedPhoto(user.id) && p?.avatar_url) setPhoto(p.avatar_url);
    setView('ready');
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    load();
  }, [load]);

  /** Applies a patch optimistically, rolling back if the write fails. */
  async function save(patch: ProfilePatch, successText = 'Saved.') {
    setSaving(true);
    setError('');
    setMessage('');
    const previous = profile;
    setProfile((p) => (p ? { ...p, ...patch } : p));

    const failure = await updateMyProfile(patch);
    setSaving(false);

    if (failure) {
      setProfile(previous);
      setError(failure);
      return false;
    }
    setMessage(successText);
    return true;
  }

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    const ok = await save({
      full_name: name.trim() || null,
      home_town: town || null,
      phone: phone.trim() || null,
    });
    if (ok) setEditing(false);
  }

  async function onPhotoChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset so choosing the same file twice still fires a change event.
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setError('');
    setMessage('');
    try {
      const result = await uploadAvatarPhoto(file);
      // Show the local copy regardless: the member picked it, and it is
      // what will render offline.
      setPhoto(result.dataUrl);
      if (result.error || !result.url) {
        setError(result.error ?? 'Could not upload that photo.');
      } else {
        await save({ avatar_url: result.url }, 'Photo updated.');
        setPicking(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not use that photo.');
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto() {
    setUploading(true);
    setError('');
    const failure = await removeAvatarPhoto();
    setUploading(false);
    if (failure) {
      setError(failure);
      return;
    }
    setPhoto(null);
    await save({ avatar_url: null }, 'Photo removed.');
  }

  async function pickAvatar(id: string) {
    setPicking(false);
    // An uploaded photo takes precedence when rendering, so choosing an
    // illustration has to clear it — otherwise the tap appears to do nothing.
    if (photo) {
      const failure = await removeAvatarPhoto();
      if (failure) {
        setError(failure);
        return;
      }
      setPhoto(null);
      await save({ avatar: id, avatar_url: null }, 'Avatar updated.');
      return;
    }
    await save({ avatar: id }, 'Avatar updated.');
  }

  async function signOut() {
    // The cached photo is this member's; leaving it would show on the next
    // person to sign in on a shared phone.
    const user = await getCurrentUser();
    if (user) clearCachedPhoto(user.id);
    setPhoto(null);
    await supabase.auth.signOut();
    setView('signed-out');
    setProfile(null);
  }

  const signInHref =
    typeof window !== 'undefined' && window.location.protocol === 'file:'
      ? 'login.html'
      : '/login';

  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <SupabaseSetupNotice feature="Your profile" />
      </div>
    );
  }

  if (view === 'loading') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        {/* Skeleton rather than a spinner: the shape of the page is already
            known, so this reads as "loading your card" instead of a stall. */}
        <div className="animate-pulse space-y-4">
          <div className="h-40 rounded-3xl bg-slate-200" />
          <div className="h-24 rounded-2xl bg-slate-200" />
          <div className="h-24 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (view === 'signed-out') {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1c6cb8] to-[#31a8c9] flex items-center justify-center shadow-lg">
          <UserRound className="w-8 h-8 text-white" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">You&apos;re not signed in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to see your profile, membership and saved rewards.
        </p>
        <a
          href={signInHref}
          className="mt-6 inline-block w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium shadow-sm hover:brightness-110 active:scale-95 transition"
        >
          Sign in
        </a>
      </div>
    );
  }

  const role: ProfileRole = profile?.role ?? 'customer';
  const RoleIcon = ROLE_ICON[role];
  const joined = joinedLabel(profile?.created_at ?? null);

  return (
    <div className="max-w-xl mx-auto px-4 py-6 sm:py-10">
      {/* Identity card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a2f5c] via-[#1c6cb8] to-[#31a8c9] text-white shadow-xl">
        <div className="absolute -top-16 -right-12 w-52 h-52 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-cyan-300/20 blur-2xl" aria-hidden="true" />

        <div className="relative p-6 sm:p-8 flex items-center gap-5">
          <button
            type="button"
            onClick={() => setPicking((p) => !p)}
            className="relative flex-shrink-0 rounded-2xl transition active:scale-95 hover:brightness-110"
            aria-label="Change avatar"
            aria-expanded={picking}
          >
            <Avatar
              avatarId={profile?.avatar}
              photo={photo}
              name={profile?.full_name}
              email={email}
              size={80}
              className="ring-1 ring-white/25"
            />
            <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white text-[#0a2f5c] flex items-center justify-center shadow-md">
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </button>

          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
              {profile?.full_name?.trim() || 'Welcome'}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80 truncate">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              {email}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium">
                <RoleIcon className="w-3.5 h-3.5" aria-hidden="true" />
                {ROLE_LABEL[role]}
              </span>
              {profile?.is_subscribed && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/90 text-amber-950 dark:text-amber-200 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  Member
                </span>
              )}
              {joined && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 text-xs text-white/80">
                  Joined {joined}
                </span>
              )}
            </div>
          </div>
        </div>

        {picking && (
          <div className="relative px-6 sm:px-8 pb-6">
            {/* Hidden inputs do the work. `capture` asks Android for the
                camera directly; without it the chooser offers the gallery. */}
            <input
              ref={cameraInput}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={onPhotoChosen}
            />
            <input
              ref={galleryInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPhotoChosen}
            />

            <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-3">
              Your photo
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => cameraInput.current?.click()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 backdrop-blur ring-1 ring-white/25 text-sm font-semibold disabled:opacity-60 hover:bg-white/25 active:scale-95 transition"
              >
                <Camera className="w-4 h-4" aria-hidden="true" />
                Take photo
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => galleryInput.current?.click()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 backdrop-blur ring-1 ring-white/25 text-sm font-semibold disabled:opacity-60 hover:bg-white/25 active:scale-95 transition"
              >
                <ImagePlus className="w-4 h-4" aria-hidden="true" />
                Choose photo
              </button>
              {photo && (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={removePhoto}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 ring-1 ring-white/20 text-sm font-medium text-white/85 disabled:opacity-60 hover:bg-white/20 active:scale-95 transition"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  Remove
                </button>
              )}
            </div>
            {uploading && (
              <p className="mt-2 text-xs text-white/80">Processing photo…</p>
            )}

            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-white/70 mb-3">
              Or pick an illustration
            </p>
            <div className="grid grid-cols-6 gap-2.5">
              {AVATARS.map((a) => {
                const active = profile?.avatar === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => pickAvatar(a.id)}
                    title={a.label}
                    aria-label={a.label}
                    aria-pressed={active}
                    className={`relative rounded-xl transition active:scale-90 hover:scale-105 ${
                      active ? 'ring-2 ring-white' : 'ring-1 ring-white/20'
                    }`}
                  >
                    <Avatar avatarId={a.id} size={44} className="w-full h-auto" />
                    {active && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[#0a2f5c] flex items-center justify-center">
                        <Check className="w-3 h-3" aria-hidden="true" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Details */}
      <section className="mt-5 rounded-2xl bg-card border border-slate-200/70 shadow-md p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-900">Your details</h2>
          {!editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setMessage('');
              }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={saveDetails} className="mt-4 space-y-3">
            <Field label="Name">
              <input
                type="text"
                value={name}
                maxLength={80}
                placeholder="Your name"
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-card focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
            <Field label="Home town">
              <select
                value={town}
                onChange={(e) => setTown(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-card focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Not set</option>
                {TOWNS.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                maxLength={20}
                placeholder="082 123 4567"
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-card focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>

            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-60 hover:brightness-110 active:scale-95 transition"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setName(profile?.full_name ?? '');
                  setTown(profile?.home_town ?? '');
                  setPhone(profile?.phone ?? '');
                  setError('');
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <dl className="mt-3 space-y-2.5">
            <Row icon={UserRound} label="Name" value={profile?.full_name?.trim()} />
            <Row
              icon={MapPin}
              label="Home town"
              value={profile?.home_town ? getTownLabel(profile.home_town) : undefined}
            />
            <Row icon={Phone} label="Phone" value={profile?.phone?.trim()} />
            <Row icon={Mail} label="Email" value={email} />
          </dl>
        )}

        {message && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
        {!editing && error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </section>

      {/* Membership */}
      <section className="mt-4 rounded-2xl bg-card border border-slate-200/70 shadow-md p-5">
        <h2 className="font-semibold text-slate-900">Membership</h2>
        <p className="mt-2 text-sm text-slate-600">
          {profile?.is_subscribed
            ? 'Your membership is active — rewards and member offers are unlocked.'
            : 'You do not have an active membership yet, so member offers stay locked.'}
        </p>
      </section>

      <button
        type="button"
        onClick={signOut}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 active:scale-95 transition"
      >
        <LogOut className="w-4 h-4" aria-hidden="true" />
        Sign out
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5 text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="text-sm text-slate-800 truncate">
          {value || <span className="text-slate-400">Not set</span>}
        </dd>
      </div>
    </div>
  );
}
