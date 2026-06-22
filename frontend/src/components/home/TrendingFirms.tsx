'use client';
import { useQuery } from '@tanstack/react-query';
import { firmApi } from '@/lib/api';
import { FirmCard } from '@/components/firms/FirmCard';
import { SectionHeader } from './SectionHeader';
import { TrendingUp } from 'lucide-react';

export function TrendingFirms() {
  const { data: firms = [], isLoading } = useQuery({
    queryKey: ['firms', 'trending'],
    queryFn: () => firmApi.trending().then(r => r.data.slice(0, 4)),
  });

  if (isLoading || !firms.length) return null;

  return (
    <section className="container mx-auto px-4 py-14">
      <SectionHeader
        icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
        title="Trending Now"
        subtitle="Most-viewed firms gaining traction in the trading community"
        href="/trending"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        {firms.map((firm: any) => <FirmCard key={firm.id} firm={firm} />)}
      </div>
    </section>
  );
}
