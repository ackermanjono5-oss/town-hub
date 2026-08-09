import Image from 'next/image';
import { SPONSORS } from '@/lib/garden-route/real-estate-brands';

export default function SponsorsGrid() {
  return (
    <div className="mt-12">
      <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
        Our Sponsors
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SPONSORS.map((sponsor) => (
          <a
            key={sponsor.id}
            href={sponsor.website}
            target="_blank"
            rel="noopener noreferrer"
            title={sponsor.name}
            className="group flex flex-col items-center rounded-xl border border-border overflow-hidden hover:border-primary hover:shadow-lg card-lift"
          >
            <div
              className="w-full flex items-center justify-center h-20 p-3"
              style={{ backgroundColor: sponsor.logoBg ?? '#ffffff' }}
            >
              <Image
                src={sponsor.logo}
                alt={sponsor.name}
                width={140}
                height={56}
                className="max-h-14 w-auto object-contain"
              />
            </div>
            <div className="w-full px-2 py-2 bg-background text-center">
              <p className="text-xs font-semibold text-foreground leading-tight">{sponsor.name}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{sponsor.tagline}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
