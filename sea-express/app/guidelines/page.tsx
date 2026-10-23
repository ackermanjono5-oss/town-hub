
const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Respect, Kindness & Zero Tolerance for Hate Speech',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Treat every member of the community with respect, dignity and courtesy.</li>
        <li>
          Hate speech, racism, discrimination, threats, bullying, harassment,
          intimidation and personal attacks are strictly prohibited.
        </li>
        <li>No abusive, degrading, insulting or deliberately offensive content.</li>
        <li>No targeting individuals or groups based on personal characteristics.</li>
        <li>
          Disagreements must remain civil. The Community Wall is not a platform for
          arguments or public fights.
        </li>
      </ul>
    ),
  },
  {
    title: '2. Strictly No Misuse of the App',
    body: (
      <>
        <p>TownHub must be used responsibly and for legitimate community purposes.</p>
        <p>The following are prohibited:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>False, misleading, fabricated or deliberately malicious posts.</li>
          <li>Spam, repetitive posts, chain messages and irrelevant content.</li>
          <li>
            Scams, fraudulent requests for money, impersonation and deceptive
            fundraising.
          </li>
          <li>Unauthorised advertising, promotions or commercial spam.</li>
          <li>Posting obscene, threatening, violent or otherwise inappropriate content.</li>
          <li>
            Using the app to threaten, stalk, intimidate, defraud or harm another
            person.
          </li>
          <li>Attempting to disrupt, exploit or misuse any app feature.</li>
        </ul>
        <p>
          Repeated or serious violations may result in content removal, suspension or
          permanent removal from the platform, subject to applicable law and the
          app&apos;s moderation procedures.
        </p>
      </>
    ),
  },
  {
    title: '3. The Community Wall — What It Is For',
    body: (
      <>
        <p>
          The Community Wall exists to help people and share responsible local
          information.
        </p>
        <p className="font-semibold text-foreground">Permitted community posts include:</p>
        <p className="font-semibold text-foreground">Lost and found pets</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Report missing dogs, cats and other pets.</li>
          <li>
            Share photographs, descriptions, the area last seen and a contact method.
          </li>
          <li>
            Report found or rescued animals and help reunite them with their owners.
          </li>
          <li>Share requests for assistance with animal rescue, where appropriate.</li>
        </ul>
        <p className="font-semibold text-foreground">Community assistance</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Help residents who are stranded or need practical assistance.</li>
          <li>Share legitimate requests for help during difficult circumstances.</li>
          <li>Offer assistance to vulnerable residents, where safe and appropriate.</li>
        </ul>
        <p className="font-semibold text-foreground">
          Stranded vehicles and roadside assistance
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Report a broken-down vehicle or a motorist who needs assistance.</li>
          <li>
            Include the general location, vehicle description and type of assistance
            needed.
          </li>
          <li>Never put yourself or other road users at risk while helping.</li>
        </ul>
        <p className="font-semibold text-foreground">
          Community safety and crime awareness
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Share responsible reports of suspected theft, break-ins, vandalism or other
            safety concerns.
          </li>
          <li>
            Report observed riots, unrest, road closures or potentially dangerous
            public disturbances.
          </li>
          <li>Share verified public safety information and useful warnings.</li>
        </ul>
        <p className="font-semibold text-foreground">Other appropriate local information</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Missing property and found items.</li>
          <li>Road hazards, storm damage and local disruptions.</li>
          <li>
            Community notices and useful information relevant to residents and
            visitors.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '4. Crime Reporting, Riots & Public Safety',
    body: (
      <>
        <p>
          Community reports can help alert neighbours, but the Community Wall is not a
          replacement for the police or emergency services.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            In an active crime, riot, violent incident or immediate threat to life,
            contact the appropriate emergency service directly.
          </li>
          <li>
            Do not confront suspected criminals or attempt to intervene in violent
            incidents.
          </li>
          <li>Do not encourage vigilantism, retaliation, mob action or violence.</li>
          <li>Do not publish unverified accusations naming people as criminals.</li>
          <li>
            Do not circulate rumours, inflammatory claims or information likely to
            incite panic or violence.
          </li>
          <li>Do not post instructions that could assist criminal activity.</li>
          <li>
            Avoid sharing sensitive operational details, such as police movements or
            the precise location of vulnerable people, where disclosure could place
            someone at risk.
          </li>
        </ul>
        <p>
          Where possible, report the incident to the relevant authorities and use the
          Community Wall only for responsible public awareness.
        </p>
      </>
    ),
  },
  {
    title: '5. Emergency Numbers — No False Calls or Misuse',
    body: (
      <>
        <p className="font-semibold text-foreground">
          Emergency numbers are for genuine emergencies only.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Never make prank calls, false reports or malicious emergency requests.</li>
          <li>
            Never use emergency features to harass, threaten or inconvenience another
            person.
          </li>
          <li>
            Never submit a false SOS alert or deliberately provide an incorrect
            location.
          </li>
          <li>
            Do not use emergency numbers for general enquiries, arguments or
            non-urgent complaints.
          </li>
          <li>
            Do not assume that posting on the Community Wall or sending a message
            through TownHub will dispatch emergency services.
          </li>
        </ul>
        <p>False emergency reports can delay help for someone whose life is in danger.</p>
        <p>
          In South Africa, dial{' '}
          <a href="tel:112" className="font-semibold text-foreground underline">
            112 from a mobile phone
          </a>{' '}
          for emergency assistance, or{' '}
          <a href="tel:10111" className="font-semibold text-foreground underline">
            10111 for a police emergency
          </a>
          . Use the appropriate verified local emergency contact for the situation.
          See the{' '}
          <a
            href="https://www.saps.gov.za/services/cc_10111.php"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            official SAPS guidance
          </a>
          .
        </p>
      </>
    ),
  },
  {
    title: '6. Privacy & Protection of Personal Information',
    body: (
      <>
        <p>Protect yourself and other members of the community.</p>
        <p>Do not post another person&apos;s:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Home address, identity number, banking details or private documents
            without proper authority.
          </li>
          <li>Private phone number or personal information without permission.</li>
          <li>
            Private conversations, photographs or videos without appropriate consent.
          </li>
          <li>Live location or sensitive information that could expose them to danger.</li>
        </ul>
        <p>
          For lost pets, stranded vehicles and community assistance, share only the
          information reasonably necessary to obtain help. Consider using a private
          contact method rather than publishing sensitive details.
        </p>
      </>
    ),
  },
  {
    title: '7. Photographs, Videos & Evidence',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Share only material you are entitled to share.</li>
        <li>
          Do not post graphic images of injuries, deceased persons or disturbing
          scenes.
        </li>
        <li>Do not alter photographs or videos to mislead the community.</li>
        <li>Do not present rumours or unverified footage as confirmed fact.</li>
        <li>
          If you have evidence of a crime, preserve it safely and provide it to the
          relevant authorities.
        </li>
      </ul>
    ),
  },
  {
    title: '8. No Public Shaming or Defamation',
    body: (
      <>
        <p>The Community Wall is not a court of law.</p>
        <p>
          Do not use the platform to settle personal disputes, damage reputations,
          expose private matters or accuse identifiable people of wrongdoing without a
          responsible and lawful basis.
        </p>
        <p>
          Concerns about a person, business or organisation should be raised through
          appropriate official channels. TownHub may remove content that creates an
          unreasonable risk of harm or violates these guidelines.
        </p>
      </>
    ),
  },
  {
    title: '9. Advertising, Fundraising & Commercial Posts',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Business advertising must comply with TownHub&apos;s advertising and
          subscription arrangements.
        </li>
        <li>
          No fraudulent fundraising, misleading charity appeals or requests designed
          to exploit vulnerable people.
        </li>
        <li>
          No unauthorised promotions, spam or repeated commercial posts on the
          Community Wall.
        </li>
        <li>
          Fundraising requests should be transparent about their purpose and the
          intended recipient.
        </li>
      </ul>
    ),
  },
  {
    title: '10. Reporting Misuse & Contacting TownHub',
    body: (
      <>
        <p>
          If you encounter hate speech, harassment, a scam, false information, misuse
          of emergency features or any other violation, please report it responsibly.
        </p>
        <p>
          <span className="font-semibold text-foreground">Email: </span>
          <a href="mailto:info@seaexpress.co.za" className="text-primary underline">
            info@seaexpress.co.za
          </a>
        </p>
        <p>Please include:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>A description of the concern.</li>
          <li>The relevant post or content, if available.</li>
          <li>The date and time of the incident.</li>
          <li>Supporting information that can be shared lawfully.</li>
        </ul>
        <p>
          Do not use this email address to report an immediate emergency. Contact the
          relevant emergency service directly.
        </p>
      </>
    ),
  },
  {
    title: '11. Moderation & Consequences',
    body: (
      <>
        <p>
          TownHub Coast Connect reserves the right, subject to applicable law and its
          moderation procedures, to review reported content and take appropriate
          action.
        </p>
        <p>
          Depending on the seriousness and frequency of a violation, actions may
          include:
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>A warning to the member.</li>
          <li>Removal or restriction of the offending content.</li>
          <li>Temporary suspension of posting privileges.</li>
          <li>Suspension or permanent removal of the account.</li>
          <li>
            Referral to the appropriate authorities where warranted or legally
            required.
          </li>
        </ol>
        <p>
          Serious threats, fraudulent activity, malicious emergency misuse and conduct
          that endangers others may warrant immediate action.
        </p>
        <p>
          TownHub cannot guarantee that every post is accurate, that every report will
          be verified or that assistance will be available. Members must use their
          judgement and contact the appropriate authorities when necessary.
        </p>
      </>
    ),
  },
  {
    title: '12. Our Community Promise',
    body: (
      <>
        <p>
          TownHub Coast Connect is built on the belief that connected communities are
          safer, stronger and more supportive.
        </p>
        <p>
          Use the Community Wall to help find lost pets, assist stranded motorists,
          share responsible safety alerts, report local disruptions and support people
          who genuinely need help.
        </p>
        <p className="font-semibold text-foreground">
          Be responsible. Be respectful. Verify before sharing. Help where you safely
          can. Never misuse emergency services.
        </p>
      </>
    ),
  },
];

export default function GuidelinesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHero
        title="Community Guidelines"
        subtitle="Official Community Wall Guidelines & Rules — connecting communities from all small towns on the Garden Route and more!"
        icon={HeroIcon}
        theme="lagoon"
        eyebrow="TownHub Coast Connect"
        className="mb-8"
      />

      <div className="space-y-4 text-sm text-foreground mb-8">
        <p>
          Welcome to TownHub Coast Connect — a community platform created to connect
          residents, visitors, families and local businesses, promote safety, share
          useful information and help one another.
        </p>
        <p>
          The Community Wall is intended for genuine community assistance, local
          awareness and responsible information sharing. By using TownHub, all members
          agree to follow these guidelines.
        </p>
      </div>

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

      <div className="border-t pt-6 mt-8 text-sm text-muted-foreground space-y-3">
        <p>
          By participating in TownHub Coast Connect, you agree to respect these
          Community Guidelines.
        </p>
        <p className="font-semibold text-foreground">
          TownHub Coast Connect — Connecting Communities from all small towns on the
          Garden Route and more!
        </p>
      </div>
    </div>
  );
}
import PageHero from '@/components/PageHero';
import { BookOpen as HeroIcon } from 'lucide-react';

