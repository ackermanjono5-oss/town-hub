
export default function SocialPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHero
        title="Social Feeds"
        subtitle="See what the Garden Route community is sharing"
        icon={HeroIcon}
        theme="coral"
        className="mb-8"
      />

      <div className="grid grid-cols-1 gap-4">
        <div className="p-5 rounded-lg border border-border hover:border-primary card-lift bg-background">
          <h3 className="font-bold text-xl mb-2 text-primary">#GardenRoute</h3>
          <p className="text-muted-foreground">Region-wide photos and posts tagged across the Garden Route.</p>
        </div>
        <div className="p-5 rounded-lg border border-border hover:border-primary card-lift bg-background">
          <h3 className="font-bold text-xl mb-2 text-primary">#MosselBay</h3>
          <p className="text-muted-foreground">What people are sharing from Mossel Bay right now.</p>
        </div>
        <div className="p-5 rounded-lg border border-border hover:border-primary card-lift bg-background">
          <h3 className="font-bold text-xl mb-2 text-primary">#GeorgeSouthAfrica</h3>
          <p className="text-muted-foreground">Posts from George and the Outeniqua area.</p>
        </div>
        <div className="p-5 rounded-lg border border-border hover:border-primary card-lift bg-background">
          <h3 className="font-bold text-xl mb-2 text-primary">#Sedgefield</h3>
          <p className="text-muted-foreground">Slow-town life and market mornings in Sedgefield.</p>
        </div>
      </div>
    </div>
  );
}
import PageHero from '@/components/PageHero';
import { Share2 as HeroIcon } from 'lucide-react';

