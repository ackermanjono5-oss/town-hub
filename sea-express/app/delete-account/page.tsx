export default function DeleteAccountPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Delete Your Account</h1>
        <p className="text-muted-foreground">Town Hub Coast Connect</p>
      </div>

      <div className="space-y-6 text-sm">
        <section>
          <h2 className="font-bold text-foreground mb-2">How to request deletion</h2>
          <p className="text-muted-foreground mb-3">
            To delete your Town Hub Coast Connect account and associated data,
            send an email to{' '}
            <a
              href="mailto:privacy@townhubcoastconnect.co.za?subject=Delete%20my%20account"
              className="text-primary hover:underline"
            >
              privacy@townhubcoastconnect.co.za
            </a>{' '}
            from the email address linked to your account, with the subject line
            &quot;Delete my account&quot;.
          </p>
          <p className="text-muted-foreground">
            We will confirm your identity using the email address on file and
            process your request within <strong>30 days</strong>.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-foreground mb-2">What gets deleted</h2>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Your account and login credentials (email, Google sign-in link).</li>
            <li>Any posts you made to the Community Wall.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-foreground mb-2">What may be retained</h2>
          <p className="text-muted-foreground">
            We may retain minimal records (such as an anonymised log of the
            deletion request itself) for up to 90 days where required for fraud
            prevention or legal compliance. No personal profile or Community Wall
            content is kept beyond that period.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-foreground mb-2">Deleting individual posts</h2>
          <p className="text-muted-foreground">
            If you only want a specific Community Wall post removed rather than
            your whole account, mention this in your email along with a
            description of the post, and we will remove it without deleting your
            account.
          </p>
        </section>

        <p className="text-xs text-muted-foreground border-t pt-4">
          See our{' '}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>{' '}
          for more on how your data is used.
        </p>
      </div>
    </div>
  );
}
