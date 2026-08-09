import { Mail, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground">JJ Production Group — Town Hub Coast Connect</p>
      </div>

      <div className="space-y-4">
        <a
          href="mailto:support@townhubcoastconnect.co.za"
          className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary card-lift bg-background"
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary flex-shrink-0">
            <Mail className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-semibold text-foreground">Email</h3>
            <p className="text-sm text-primary">support@townhubcoastconnect.co.za</p>
          </div>
        </a>

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
