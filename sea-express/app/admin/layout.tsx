import RequireAdmin from '@/components/admin/RequireAdmin';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <AdminHeader />
        {children}
      </div>
    </RequireAdmin>
  );
}
