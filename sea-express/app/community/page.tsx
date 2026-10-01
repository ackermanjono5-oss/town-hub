import SupabaseSetupNotice from '@/components/SupabaseSetupNotice';

export default function CommunityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Community Wall</h1>
        <p className="text-muted-foreground">
          Lost & found, questions and local recommendations
        </p>
      </div>

      <SupabaseSetupNotice feature="Community Wall" />
    </div>
  );
}
