import { CircleAlert } from 'lucide-react';

const QUICK_LINKS = [
  { href: '/directory', label: 'Directory' },
  { href: '/medical', label: 'Medical' },
  { href: '/businesses', label: 'Businesses' },
  { href: '/accommodation', label: 'Hotels & B&Bs' },
  { href: '/events', label: 'Events' },
  { href: '/property', label: 'Property' },
  { href: '/guidelines', label: 'Community Guidelines' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/delete-account', label: 'Delete Account' },
];

export default function SiteFooter() {
  return (
    <footer className="border-t bg-background mt-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">Town Hub Coast Connect</h3>
            <p className="text-sm text-muted-foreground">
              Connecting the Garden Route community with news, events, and essential
              services.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {QUICK_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="text-primary hover:underline">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Emergency</h3>
            <a
              href="/sos"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-danger text-danger-foreground hover:opacity-90 transition"
            >
              <CircleAlert className="w-4 h-4" aria-hidden="true" />
              SOS
            </a>
          </div>
        </div>
        <div className="border-t pt-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Town Hub Coast Connect. All rights
            reserved to JJ Production Group.
          </p>
        </div>
      </div>
    </footer>
  );
}
