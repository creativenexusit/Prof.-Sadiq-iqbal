import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/data';
import ProfileForm from './ProfileForm';

export default async function AdminProfilePage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }

  const profile = await getProfile();
  const plainProfile = JSON.parse(JSON.stringify(profile));

  return (
    <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto pb-4">
      <div className="pb-2.5 sm:pb-3 border-b border-[#1F1F24] flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
          Profile &amp; Settings
        </h1>
        <span className="text-[11px] font-mono text-neutral-400">
          Faculty Admin
        </span>
      </div>

      <ProfileForm initialProfile={plainProfile} />
    </div>
  );
}
