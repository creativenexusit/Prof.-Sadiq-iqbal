import { getAdminSession } from '@/lib/auth';
import { getProfile } from '@/lib/data';
import AdminThemeShell from '@/components/admin/AdminThemeShell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // If on login page, let it render without layout frame
  if (!session) {
    return <>{children}</>;
  }

  const profile = await getProfile().catch(() => null);
  const initialColor = profile?.themeConfig?.primaryColor || '#0EA5E9';

  return (
    <AdminThemeShell
      adminEmail={session.email}
      fullName={profile?.fullName || 'Prof. Sadiq Iqbal'}
      initialColor={initialColor}
    >
      {children}
    </AdminThemeShell>
  );
}
