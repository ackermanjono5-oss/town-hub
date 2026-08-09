const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Our Community Values',
    body: (
      <>
        <p>Town Hub Coast Connect is built on the principles of:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Respect</li>
          <li>Honesty</li>
          <li>Community Support</li>
          <li>Safety</li>
          <li>Integrity</li>
          <li>Kindness</li>
          <li>Responsibility</li>
        </ul>
        <p>Every user is expected to contribute positively to the community.</p>
      </>
    ),
  },
  {
    title: '2. Purpose of the Platform',
    body: (
      <>
        <p>Town Hub Coast Connect is intended to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Share local news and community information.</li>
          <li>Promote local businesses and tourism.</li>
          <li>
            Help residents and visitors locate restaurants, hotels, guest houses, bed
            and breakfasts, medical services, emergency contacts, attractions, and
            other local services.
          </li>
          <li>Share local events and activities.</li>
          <li>Provide emergency communication during times of crisis.</li>
          <li>Encourage community support and public safety.</li>
        </ul>
      </>
    ),
  },
  {
    title: '3. Community Wall',
    body: (
      <>
        <p>
          The Community Wall exists to provide helpful, factual, and
          community-focused information.
        </p>
        <p>Appropriate posts include:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Emergency situations.</li>
          <li>Fires.</li>
          <li>Floods.</li>
          <li>Severe weather.</li>
          <li>Road closures.</li>
          <li>Missing persons.</li>
          <li>Missing pets.</li>
          <li>Community alerts.</li>
          <li>Requests for assistance.</li>
          <li>Local information.</li>
          <li>Public safety notices.</li>
          <li>Community event information.</li>
        </ul>
        <p>
          The Community Wall is not a social media platform for arguments, personal
          opinions intended to harm others, or offensive behaviour.
        </p>
      </>
    ),
  },
  {
    title: '4. Zero Tolerance for Abuse',
    body: (
      <>
        <p>Town Hub Coast Connect has a zero-tolerance policy towards abuse.</p>
        <p>Users may not:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Harass another person.</li>
          <li>Bully another person.</li>
          <li>Threaten another person.</li>
          <li>Intimidate another person.</li>
          <li>Defame any individual or business.</li>
          <li>Post false accusations.</li>
          <li>Spread rumours.</li>
          <li>Share misleading information.</li>
          <li>Post offensive language.</li>
          <li>Use discriminatory or hateful language.</li>
          <li>Encourage violence.</li>
          <li>Incite panic.</li>
          <li>Publish inappropriate images or videos.</li>
          <li>Damage the reputation of another individual or business.</li>
        </ul>
        <p>
          Any content that is considered abusive, offensive, harmful, defamatory, or
          disruptive may be removed immediately.
        </p>
        <p>
          Users responsible for such conduct may have their accounts permanently
          suspended without warning.
        </p>
      </>
    ),
  },
  {
    title: '5. False Information',
    body: (
      <>
        <p>Only factual and truthful information may be shared.</p>
        <p>Users must never knowingly publish:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>False emergencies.</li>
          <li>Fake news.</li>
          <li>Hoaxes.</li>
          <li>Edited or misleading content.</li>
          <li>Information intended to create fear or panic.</li>
        </ul>
        <p>False information can place lives at risk and will not be tolerated.</p>
      </>
    ),
  },
  {
    title: '6. SOS Emergency Services',
    body: (
      <>
        <p>The SOS feature has been created solely for genuine emergencies.</p>
        <p>It is intended for:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Medical emergencies.</li>
          <li>Fires.</li>
          <li>Floods.</li>
          <li>Rescue situations.</li>
          <li>Road accidents.</li>
          <li>Public safety emergencies.</li>
          <li>Natural disasters.</li>
          <li>Situations where immediate assistance is required.</li>
        </ul>
        <p>The SOS feature is not to be used for:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Testing.</li>
          <li>Jokes.</li>
          <li>Prank calls.</li>
          <li>False emergency reports.</li>
          <li>Non-emergency situations.</li>
        </ul>
      </>
    ),
  },
  {
    title: '7. Prank Calls and Misuse of SOS',
    body: (
      <>
        <p>Any misuse of the SOS feature is regarded as extremely serious.</p>
        <p>Users are strictly prohibited from:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Making prank emergency calls.</li>
          <li>Submitting false emergency alerts.</li>
          <li>Deliberately wasting emergency resources.</li>
          <li>Interfering with emergency response.</li>
        </ul>
        <p>
          All emergency interactions, account activity, and available identifying
          information may be recorded.
        </p>
        <p>
          Where permitted by law, Town Hub Coast Connect reserves the right to
          provide relevant information to law enforcement agencies or emergency
          service providers for the investigation of false reports, prank calls,
          fraud, or criminal activity.
        </p>
        <p>
          Users found abusing emergency services will have their accounts
          permanently removed and may face legal action where applicable.
        </p>
      </>
    ),
  },
  {
    title: '8. Respect for Businesses',
    body: (
      <>
        <p>Town Hub Coast Connect exists to support local businesses.</p>
        <p>Users may not:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Publish false reviews.</li>
          <li>Defame businesses.</li>
          <li>Damage business reputations.</li>
          <li>Harass business owners.</li>
          <li>Use the platform to unfairly attack businesses.</li>
        </ul>
        <p>Constructive feedback should always be respectful and truthful.</p>
      </>
    ),
  },
  {
    title: '9. Business Advertising',
    body: (
      <>
        <p>
          Businesses advertising on Town Hub Coast Connect must maintain an active
          advertising subscription.
        </p>
        <p>
          Businesses that fail to maintain their advertising subscription may have
          their listings, advertisements, promotional material, and featured
          placements removed.
        </p>
      </>
    ),
  },
  {
    title: '10. Subscription Access',
    body: (
      <>
        <p>Certain services are available only to active subscribers.</p>
        <p>These include:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Community Wall participation.</li>
          <li>Community messaging.</li>
          <li>SOS activation.</li>
          <li>Premium communication features.</li>
          <li>Other subscriber-only services.</li>
        </ul>
        <p>
          Failure to maintain an active subscription may result in restricted access
          to these features.
        </p>
      </>
    ),
  },
  {
    title: '11. Location Services',
    body: (
      <>
        <p>
          When an SOS alert is activated, Town Hub Coast Connect may use GPS
          technology to determine your location.
        </p>
        <p>
          Location information may be shared with authorised emergency contacts or
          participating emergency service providers for emergency purposes only.
        </p>
      </>
    ),
  },
  {
    title: '12. Respectful Communication',
    body: (
      <>
        <p>Users must communicate respectfully at all times.</p>
        <p>Treat others with dignity regardless of:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Race.</li>
          <li>Gender.</li>
          <li>Nationality.</li>
          <li>Religion.</li>
          <li>Disability.</li>
          <li>Occupation.</li>
          <li>Age.</li>
        </ul>
        <p>
          Town Hub Coast Connect is committed to creating an inclusive and welcoming
          environment for everyone.
        </p>
      </>
    ),
  },
  {
    title: '13. Reporting Abuse',
    body: (
      <>
        <p>Users are encouraged to report:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>False information.</li>
          <li>Harassment.</li>
          <li>Offensive content.</li>
          <li>Fake emergencies.</li>
          <li>Abuse of emergency services.</li>
          <li>Dangerous behaviour.</li>
          <li>Spam.</li>
        </ul>
      </>
    ),
  },
  {
    title: '14. Account Suspension',
    body: (
      <>
        <p>
          Town Hub Coast Connect reserves the right to remove content, suspend
          accounts, or permanently ban users who violate these Community Guidelines.
        </p>
        <p>
          Repeated or serious violations may result in permanent removal without
          prior notice.
        </p>
      </>
    ),
  },
  {
    title: '15. Our Commitment',
    body: (
      <>
        <p>
          Town Hub Coast Connect has been developed to strengthen our communities,
          improve public safety, support local businesses, assist tourists, and make
          it easier for everyone to access the information and services they need
          with the touch of a button.
        </p>
        <p>
          We ask every member of our community to use this platform responsibly,
          respectfully, and honestly.
        </p>
        <p>
          Together, we can build a safer, stronger, more connected community for
          residents, visitors, businesses, and future generations.
        </p>
      </>
    ),
  },
];

export default function GuidelinesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Town Hub Coast Connect</h1>
        <h2 className="text-lg font-semibold text-muted-foreground mb-1">
          Community Guidelines
        </h2>
        <p className="text-sm text-muted-foreground">Effective Date: [Insert Date]</p>
      </div>

      <div className="space-y-4 text-sm text-foreground mb-8">
        <p>Welcome to Town Hub Coast Connect.</p>
        <p>
          Town Hub Coast Connect has been created to unite our communities by
          providing a safe, reliable, and informative platform for residents,
          businesses, visitors, tourists, and emergency services throughout the
          Garden Route and surrounding communities.
        </p>
        <p>
          Our mission is to create a trusted digital community where people can stay
          informed, support local businesses, promote tourism, access emergency
          information, and assist one another during times of need.
        </p>
        <p>
          Every user plays an important role in maintaining the integrity of this
          platform. By using Town Hub Coast Connect, you agree to comply with these
          Community Guidelines.
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
          By creating an account and using Town Hub Coast Connect, you acknowledge
          that you have read, understood, and agreed to comply with these Community
          Guidelines. Failure to comply may result in the suspension or permanent
          termination of your account and, where appropriate, referral to the
          relevant law enforcement authorities.
        </p>
      </div>
    </div>
  );
}
