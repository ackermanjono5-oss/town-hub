import Image from 'next/image';
import { Compass, Stethoscope, Store } from 'lucide-react';
import AdvertCarousel from '@/components/AdvertCarousel';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <Image
        src="/town-hub-logo.png"
        alt="Town Hub logo"
        width={160}
        height={160}
        className="mx-auto mb-4 w-32 h-32 sm:w-40 sm:h-40"
        priority
      />
      <h1 className="text-4xl font-bold mb-4">Town Hub</h1>
      <p className="text-muted-foreground mb-8">
        News, events, directory, real estate, and emergency services for the Garden
        Route, South Africa.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <a
          href="/directory"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
        >
          <Compass className="w-4 h-4" aria-hidden="true" />
          Restaurant Directory
        </a>
        <a
          href="/medical"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
        >
          <Stethoscope className="w-4 h-4" aria-hidden="true" />
          Medical Directory
        </a>
        <a
          href="/businesses"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
        >
          <Store className="w-4 h-4" aria-hidden="true" />
          Business Directory
        </a>
      </div>
      <AdvertCarousel />
    </div>
  );
}
