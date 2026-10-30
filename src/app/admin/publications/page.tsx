import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getPublications } from '@/lib/data';
import PublicationsManager from './PublicationsManager';

export default async function AdminPublicationsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }

  const publications = await getPublications();
  const plainPublications = JSON.parse(JSON.stringify(publications));

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <PublicationsManager initialPublications={plainPublications} />
    </div>
  );
}
