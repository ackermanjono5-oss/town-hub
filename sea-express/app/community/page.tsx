import { PawPrint, Car, ShieldAlert, Megaphone, Sparkles, BookOpen } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { Users as HeroIcon } from 'lucide-react';

// What the wall is for, from the official Community Wall guidelines.
const TOPICS = [
  { icon: PawPrint, title: 'Lost & found pets', text: 'Missing dogs, cats and rescued animals, with photos and where they were last seen.', chip: 'bg-amber-100 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300' },
  { icon: Car, title: 'Stranded motorists', text: 'Broken-down vehicles and roadside help, without putting anyone at risk.', chip: 'bg-sky-100 dark:bg-sky-400/15 text-sky-700 dark:text-sky-300' },
  { icon: ShieldAlert, title: 'Safety alerts', text: 'Responsible reports of theft, unrest, road closures and storm damage.', chip: 'bg-rose-100 dark:bg-rose-400/15 text-rose-700 dark:text-rose-300' },
  { icon: Megaphone, title: 'Community notices', text: 'Missing property, local disruptions and useful information for residents.', chip: 'bg-emerald-100 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-300' },
];

export default function CommunityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHero
        title="Community Wall"
        subtitle="Lost & found, questions and local recommendations"
        icon={HeroIcon}
        theme="coral"
        className="mb-8"
      />

      <section className="relative overflow-hidden rounded-3xl bg-card/85 backdrop-blur p-6 shadow-[0_14px_34px_-20px_rgba(15,23,42,0.45)] ring-1 ring-white/70 dark:ring-white/10">
        <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-rose-200/40 dark:bg-rose-400/15 blur-3xl" aria-hidden="true" />
        <span className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#d4416a] to-[#ff8f7a] text-white text-xs font-bold tracking-wide shadow">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          Coming soon
        </span>
        <h2 className="relative mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
          A place for neighbours to help each other
        </h2>
        <p className="relative mt-2 text-slate-600">
          The Community Wall is on its way. Members will be able to post and respond to local
          notices like these:
        </p>

        <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
          {TOPICS.map(({ icon: Icon, title, text, chip }, i) => (
            <div
              key={title}
              style={{ ['--i' as string]: i }}
              className="rise-in flex gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-slate-100"
            >
              <span className={`inline-flex items-center justify-center w-10 h-10 flex-none rounded-xl ${chip}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold text-slate-900">{title}</span>
                <span className="block text-sm text-slate-600">{text}</span>
              </span>
            </div>
          ))}
        </div>

        <a
          href="/guidelines"
          className="relative mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#0f172a] dark:bg-[#1e3a5f] text-white text-sm font-semibold shadow-lg hover:bg-[#1e293b] dark:hover:bg-[#244870] active:scale-95 transition"
        >
          <BookOpen className="w-4 h-4" aria-hidden="true" />
          Read the Community Wall guidelines
        </a>
      </section>
    </div>
  );
}
