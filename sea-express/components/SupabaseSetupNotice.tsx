export default function SupabaseSetupNotice({ feature }: { feature?: string }) {
  return (
    <div className="p-4 bg-yellow-100 dark:bg-yellow-400/15 text-yellow-800 dark:text-yellow-300 rounded">
      Please configure your Supabase environment variables for {feature || 'this feature'}.
    </div>
  );
}
