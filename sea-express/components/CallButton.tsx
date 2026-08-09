import { Ambulance, Flame, LifeBuoy, Lock, Shield, Users, Phone } from 'lucide-react';
import type { EmergencyContact } from '@/lib/garden-route/emergency';

const ICONS = {
  nsri: LifeBuoy,
  police: Shield,
  ambulance: Ambulance,
  fire: Flame,
  security: Lock,
  neighbourhood: Users,
};

export default function CallButton({ contact }: { contact: EmergencyContact }) {
  const Icon = ICONS[contact.type];
  return (
    <a
      href={`tel:${contact.phone}`}
      className="flex items-center gap-3 w-full p-4 rounded-lg border border-border bg-background hover:bg-secondary hover:border-primary card-lift active:scale-[0.99]"
    >
      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary flex-shrink-0">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </span>
      <div className="flex-1">
        <p className="font-medium">{contact.name}</p>
        <p className="text-sm text-muted-foreground">{contact.phone}</p>
      </div>
      <Phone className="w-5 h-5 text-primary" aria-hidden="true" />
    </a>
  );
}
