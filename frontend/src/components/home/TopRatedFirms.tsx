'use client';
import { useQuery } from '@tanstack/react-query';
import { firmApi } from '@/lib/api';
import { FirmCard } from '@/components/firms/FirmCard';
import { SectionHeader } from './SectionHeader';
import { Star } from 'lucide-react';

export function TopRatedFirms() {
  const { data: firms = [], isLoading } = useQuery({
    queryKey: ['firms', 'top-rated'],
    queryFn: () => firmApi.topRated().then(r => r.data.slice(0, 4)),
  });

  if (isLoading || !firms.length) return null;

  return (
    <section className="bg-muted/30 py-14">
      <div className="container mx-auto px-4">
        <SectionHeader
          icon={<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
          title="Top Rated Prop Firms"
          subtitle="Highest community ratings based on verified trader reviews"
          href="/top-rated"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {firms.map((firm: any) => <FirmCard key={firm.id} firm={firm} />)}
        </div>
      </div>
    </section>
  );
}
