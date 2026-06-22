'use client';
import { useQuery } from '@tanstack/react-query';
import { firmApi } from '@/lib/api';
import { FirmCard } from '@/components/firms/FirmCard';
import { SectionHeader } from './SectionHeader';
import { Star } from 'lucide-react';

export function FeaturedFirms() {
  const { data: firms = [], isLoading } = useQuery({
    queryKey: ['firms', 'featured'],
    queryFn: () => firmApi.featured().then(r => r.data),
  });

  if (isLoading) return <SectionSkeleton />;
  if (!firms.length) return null;

  return (
    <section className="container mx-auto px-4 py-14">
      <SectionHeader
        icon={<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
        title="Featured Prop Firms"
        subtitle="Handpicked firms offering the best value for traders"
        href="/firms?sort=featured"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
        {firms.map((firm: any) => <FirmCard key={firm.id} firm={firm} />)}
      </div>
    </section>
  );
}

function SectionSkeleton() {
  return (
    <section className="container mx-auto px-4 py-14">
      <div className="h-8 bg-muted rounded w-64 mb-8 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    </section>
  );
}
