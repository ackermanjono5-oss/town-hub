'use client';

import { useState } from 'react';
import { Phone } from 'lucide-react';
import { TOWNS, getTownLabel } from '@/lib/garden-route/towns';
import {
  NATIONAL_CONTACTS,
  getEmergencyContactsByTown,
} from '@/lib/garden-route/emergency';
import PageHero from '@/components/PageHero';
import { Siren as HeroIcon } from 'lucide-react';

export default function SOSPage() {
  const [town, setTown] = useState(TOWNS[0].slug);
  const townLabel = getTownLabel(town);
  const townContacts = getEmergencyContactsByTown(town);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHero
        title="Emergency SOS"
        subtitle="Quick access to emergency services. Tap any number to call."
        icon={HeroIcon}
        theme="ember"
        eyebrow="Emergency"
        className="mb-8"
      />

      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">Select Town:</label>
        <select
          value={town}
          onChange={(e) => setTown(e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {TOWNS.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">{townLabel} Emergency Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {townContacts.map((contact) => (
              <a
                key={contact.id}
                href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                className="p-4 rounded-lg border border-danger/30 hover:border-danger hover:bg-danger/5 transition flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-foreground">{contact.name}</h3>
                  <p className="text-danger font-bold text-lg">{contact.phone}</p>
                </div>
                <Phone className="w-6 h-6 text-danger" />
              </a>
            ))}
            {townContacts.length === 0 && (
              <p className="text-muted-foreground">No local contacts listed for {townLabel}.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">National Emergency Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NATIONAL_CONTACTS.map((contact) => (
              <a
                key={contact.id}
                href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                className="p-4 rounded-lg border border-border hover:border-primary transition flex items-center justify-between bg-accent/5"
              >
                <div>
                  <h3 className="font-semibold text-foreground">{contact.name}</h3>
                  <p className="text-primary font-bold text-lg">{contact.phone}</p>
                </div>
                <Phone className="w-6 h-6 text-primary" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
