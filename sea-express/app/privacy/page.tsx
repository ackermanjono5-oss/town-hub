const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: 'Information We Collect',
    body: (
      <>
        <p>Town Hub Coast Connect collects the following information:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Email address</strong> — collected when you sign in, used to
            send you a secure magic-link login email via our authentication
            provider (Supabase). We do not set or store passwords.
          </li>
          <li>
            <strong>Location data</strong> — collected only when you actively use
            the Emergency SOS &quot;Share Location&quot; feature, so it can be
            shared with emergency contacts or services. Location is not collected
            in the background and is not tracked continuously.
          </li>
          <li>
            <strong>Community Wall posts</strong> — any content you choose to
            submit (text, alerts, community posts) is stored so it can be
            displayed to other users.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'How We Use Information',
    body: (
      <>
        <p>Information collected is used only to operate the app, specifically to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Authenticate you and keep your session signed in.</li>
          <li>Share your location during an active SOS request, at your request.</li>
          <li>Display Community Wall content to other users of the app.</li>
        </ul>
        <p>
          We do not use your information for advertising, profiling, or any
          purpose beyond operating the features described above.
        </p>
      </>
    ),
  },
  {
    title: 'Data Sharing',
    body: (
      <>
        <p>
          We do not sell your personal information. Data is processed by the
          following third-party service providers strictly to operate the app:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Supabase</strong> — hosts our database and handles
            authentication (magic-link emails).
          </li>
        </ul>
        <p>
          Location shared through the SOS feature is only sent to the emergency
          contact or service you choose to share it with at the time.
        </p>
      </>
    ),
  },
  {
    title: 'Data Retention',
    body: (
      <p>
        Account and Community Wall data is retained for as long as your account
        is active. You may request deletion of your account and associated data
        at any time by contacting us using the details below.
      </p>
    ),
  },
  {
    title: 'Your Rights',
    body: (
      <>
        <p>You may at any time:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Request access to the personal data we hold about you.</li>
          <li>Request correction or deletion of your data.</li>
          <li>Withdraw consent by deleting your account.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Children’s Privacy',
    body: (
      <p>
        Town Hub Coast Connect is not directed at children under 13, and we do
        not knowingly collect personal information from children under 13.
      </p>
    ),
  },
  {
    title: 'Changes to This Policy',
    body: (
      <p>
        We may update this privacy policy from time to time. Material changes
        will be reflected by updating the effective date below.
      </p>
    ),
  },
  {
    title: 'Contact Us',
    body: (
      <p>
        Questions about this privacy policy or your data can be sent to{' '}
        <a href="mailto:privacy@townhubcoastconnect.co.za" className="text-primary hover:underline">
          privacy@townhubcoastconnect.co.za
        </a>
        .
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          Town Hub Coast Connect — Effective Date: 13 July 2026
        </p>
      </div>

      <p className="text-sm text-foreground mb-8">
        This Privacy Policy explains what information Town Hub Coast Connect
        (&quot;the App&quot;), operated by JJ Production Group, collects, how it is
        used, and your rights regarding that information.
      </p>

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h3 className="font-bold text-foreground mb-2">{section.title}</h3>
            <div className="space-y-2 text-sm text-muted-foreground [&_ul]:text-muted-foreground">
              {section.body}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
