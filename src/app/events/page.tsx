import { getProfile, getAcademicItems, getAcademicEvents } from '@/lib/data';
import PortfolioShell from '@/components/home/PortfolioShell';
import EventsClient from './EventsClient';

export const metadata = {
  title: 'Academic Events & Keynotes | Prof. Sadiq Iqbal',
  description:
    'Keynote addresses, international conference presentations, academic seminars, and computing workshops by Prof. Sadiq Iqbal.',
  alternates: {
    canonical: '/events',
  },
};

export default async function EventsPage() {
  const [profile, talks, fallbackEvents] = await Promise.all([
    getProfile(),
    getAcademicItems({ category: 'talk' }),
    getAcademicEvents(50),
  ]);

  return (
    <PortfolioShell profile={profile}>
      <EventsClient talks={talks} fallbackEvents={fallbackEvents} />
    </PortfolioShell>
  );
}
