import { Mail, MapPin } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { Mail as HeroIcon } from 'lucide-react';
import { BUSINESS_REGISTRATIONS_EMAIL, MEMBER_REGISTRATIONS_EMAIL } from '@/lib/contact';

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <PageHero
        title="Contact Us"
        subtitle="JJ Production Group — Town Hub Coast Connect"
        icon={HeroIcon}
        theme="ocean"
        eyebrow="Town Hub"
        className="mb-8"
      />

      <div className="space-y-4">
        <EmailCard title="Email" email="support@townhubcoastconnect.co.za" />
        <EmailCard
          title="Member registrations"
          note="Help signing up for a Town Hub account"
          email={MEMBER_REGISTRATIONS_EMAIL}
        />
        <EmailCard
          title="Business registrations"
          note="Joining the Business Rewards Portal"
          email={BUSINESS_REGISTRATIONS_EMAIL}
        />

        <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-background">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary flex-shrink-0">
            <MapPin className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-semibold text-foreground">Location</h3>
            <p className="text-sm text-muted-foreground">George, Western Cape, South Africa</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-8 border-t pt-4">
        For privacy or data requests, see our{' '}
        <a href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </a>{' '}
        and{' '}
        <a href="/delete-account" className="text-primary hover:underline">
          Delete Account
        </a>{' '}
        pages.
      </p>
    </div>
  );
}

function EmailCard({ title, note, email }: { title: string; note?: string; email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary card-lift bg-background"
    >
      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary flex-shrink-0">
        <Mail className="w-5 h-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
        <p className="text-sm text-primary break-all">{email}</p>
      </div>
    </a>
  );
}
