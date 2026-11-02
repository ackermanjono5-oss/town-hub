'use client';

import { useState } from 'react';
import { Phone, Shield, Siren } from 'lucide-react';
import { TOWNS } from '@/lib/garden-route/towns';
import {
  NATIONAL_CONTACTS,
  getEmergencyContactsByTown,
} from '@/lib/garden-route/emergency';
import PageHero from '@/components/PageHero';
import CallButton from '@/components/CallButton';
import TownPills from '@/components/TownPills';
import { Siren as HeroIcon } from 'lucide-react';

// Only towns with verified local numbers get a pill, so choosing a town
// never lands on an empty list in an emergency.
const TOWNS_WITH_NUMBERS = TOWNS.filter((t) => getEmergencyContactsByTown(t.slug).length > 0);

// The two numbers that work anywhere get the big buttons; the rest of the
// national list follows underneath.
const PRIMARY = [
  { phone: '112', title: 'Any emergency', note: 'From any mobile phone', icon: Siren },
  { phone: '10111', title: 'Police', note: 'SAPS emergency line', icon: Shield },
];
const OTHER_NATIONAL = NATIONAL_CONTACTS.filter((c) => !PRIMARY.some((p) => p.phone === c.phone));

export default function SOSPage() {
  const [town, setTown] = useState(TOWNS_WITH_NUMBERS[0]?.slug ?? '');
  const townContacts = getEmergencyContactsByTown(town);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHero
        title="Emergency SOS"
        subtitle="Tap a number to call. Help is one tap away."
        icon={HeroIcon}
        theme="ember"
        eyebrow="Emergency"
        className="mb-6"
      />

      {/* The numbers that matter most, as big as possible. */}
      <section className="grid grid-cols-2 gap-3" aria-label="Main emergency numbers">
        {PRIMARY.map(({ phone, title, note, icon: Icon }) => (
          <a
            key={phone}
            href={`tel:${phone}`}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#b91c1c] via-[#dc2626] to-[#f2643d] p-4 text-white shadow-[0_18px_34px_-18px_rgba(220,38,38,0.95)] transition active:scale-[0.97]"
          >
            <Icon className="absolute -bottom-3 -right-3 h-20 w-20 text-white/15" strokeWidth={1.5} aria-hidden="true" />
            <span className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-white/85">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {title}
            </span>
            <span className="mt-1 block text-[34px] font-extrabold leading-none tracking-tight">{phone}</span>
            <span className="mt-1.5 block text-[12px] text-white/85">{note}</span>
          </a>
        ))}
      </section>

      <section className="mt-8">
        <SectionTitle>More national numbers</SectionTitle>
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {OTHER_NATIONAL.map((contact) => (
            <CallButton key={contact.id} contact={contact} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle>Local numbers</SectionTitle>
        <div className="mb-3 rounded-2xl border border-white/60 dark:border-white/10 bg-card/85 p-4 shadow-lg backdrop-blur">
          <TownPills towns={TOWNS_WITH_NUMBERS} value={town} onChange={setTown} />
        </div>
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {townContacts.map((contact) => (
            <CallButton key={contact.id} contact={contact} />
          ))}
        </div>
        <p className="mt-3 text-[13px] text-slate-600">
          Local numbers are listed for {TOWNS_WITH_NUMBERS.length} towns so far. Anywhere else on the
          Garden Route, call 112 or one of the national numbers above.
        </p>
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-[#7f1d1d] dark:text-red-300">
      <span className="h-[3px] w-6 rounded-full bg-gradient-to-r from-[#dc2626] to-[#f2643d]" aria-hidden="true" />
      {children}
    </h2>
  );
}
