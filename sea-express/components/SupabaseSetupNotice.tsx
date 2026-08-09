export default function SupabaseSetupNotice({ feature }: { feature?: string }) {
  return (
    <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
      Please configure your Supabase environment variables for {feature || 'this feature'}.
    </div>
  );
}
