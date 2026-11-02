import { Ambulance, Flame, LifeBuoy, Lock, Phone, Shield, Siren, Users } from 'lucide-react';
import type { EmergencyContact } from '@/lib/garden-route/emergency';

const ICONS = {
  general: Siren,
  nsri: LifeBuoy,
  police: Shield,
  ambulance: Ambulance,
  fire: Flame,
  security: Lock,
  neighbourhood: Users,
};

/** One emergency number as a full-width row: tap anywhere to call. */
export default function CallButton({ contact }: { contact: EmergencyContact }) {
  const Icon = ICONS[contact.type];
  return (
    <a
      href={`tel:${contact.phone.replace(/\s+/g, '')}`}
      className="flex w-full items-center gap-3 rounded-2xl bg-card/90 p-3.5 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.5)] ring-1 ring-white/70 dark:ring-white/10 transition active:scale-[0.98] hover:-translate-y-0.5"
    >
      <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-red-50 dark:bg-red-400/10 text-[#dc2626] dark:text-red-400">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-slate-900">{contact.name}</span>
        <span className="block text-[15px] font-bold tracking-wide text-[#dc2626] dark:text-red-400">{contact.phone}</span>
      </span>
      <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#dc2626] text-white shadow-md">
        <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
    </a>
  );
}
