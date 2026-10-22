import { Users, Store, Gift, Receipt } from 'lucide-react';

const CARDS = [
  { href: '/admin/members', label: 'Members', description: 'Switch customer rewards memberships on or off', icon: Users },
  { href: '/admin/businesses', label: 'Businesses', description: 'Review applications, advertising status and access', icon: Store },
  { href: '/admin/offers', label: 'Offers', description: 'Approve submitted offers and manage them per business', icon: Gift },
  { href: '/admin/redemptions', label: 'Redemptions', description: 'View all reward redemptions', icon: Receipt },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Town Hub Admin</h1>
      <p className="text-muted-foreground mb-6">Manage Town Hub Rewards businesses, offers, and redemptions.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CARDS.map(({ href, label, description, icon: Icon }) => (
          <a
            key={href}
            href={href}
            className="p-5 rounded-xl border border-border bg-background hover:border-primary hover:shadow-lg card-lift"
          >
            <Icon className="w-6 h-6 text-primary mb-2" aria-hidden="true" />
            <p className="font-semibold">{label}</p>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
