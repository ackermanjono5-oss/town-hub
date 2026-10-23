import { Siren } from 'lucide-react';

const EXPLORE = [
  { href: '/directory', label: 'Restaurants' },
  { href: '/medical', label: 'Medical' },
  { href: '/businesses', label: 'Businesses' },
  { href: '/accommodation', label: 'Hotels & B&Bs' },
  { href: '/attorneys', label: 'Attorneys' },
  { href: '/events', label: 'Events' },
  { href: '/property', label: 'Property' },
  { href: '/rewards', label: 'Rewards' },
];

const ABOUT = [
  { href: '/guidelines', label: 'Community Guidelines' },
  { href: '/legal-notices', label: 'Legal Notices' },
  { href: '/business', label: 'Business Rewards Portal' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/delete-account', label: 'Delete Account' },
];

/**
 * Deep-ocean footer with a wave along its top edge, so the page ends at
 * "the sea" rather than a flat grey bar. Two link columns that sit
 * side by side even on a phone, and the SOS button kept prominent.
 */
export default function SiteFooter() {
  return (
    <footer className="relative mt-12 bg-gradient-to-b from-[#0d3b66] to-[#082640] text-white font-[family-name:var(--font-jakarta)]">
      <svg
        className="absolute -top-8 left-0 w-full h-8 text-[#0d3b66]"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path fill="currentColor" d="M0,40 C240,80 480,0 720,32 C960,64 1200,8 1440,36 L1440,80 L0,80 Z" />
      </svg>

      <div className="max-w-5xl mx-auto px-5 pt-8 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-extrabold tracking-tight">Town Hub Coast Connect</p>
            <p className="mt-1 max-w-sm text-sm text-white/70">
              Connecting the Garden Route — from Witsand to Storms River.
            </p>
          </div>
          <a
            href="/sos"
            className="flex-none inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#ef4444] text-white text-sm font-bold shadow-lg shadow-black/30 hover:brightness-110 active:scale-95 transition"
          >
            <Siren className="w-4 h-4" aria-hidden="true" />
            SOS
          </a>
        </div>

        <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-6">
          <FooterColumn title="Explore" links={EXPLORE} />
          <FooterColumn title="Town Hub" links={ABOUT} />
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 text-center text-xs text-white/55">
          &copy; {new Date().getFullYear()} Town Hub Coast Connect. All rights reserved to JJ Production
          Group.
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7fd3ea]">{title}</p>
      <ul className="space-y-2 text-sm">
        {links.map(({ href, label }) => (
          <li key={href}>
            <a href={href} className="text-white/85 hover:text-white hover:underline underline-offset-4">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
