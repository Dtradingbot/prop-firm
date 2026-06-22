'use client';
import { useQuery } from '@tanstack/react-query';
import { firmApi } from '@/lib/api';
import { FirmCard } from '@/components/firms/FirmCard';
import { TrendingUp, Flame } from 'lucide-react';
import { PropFirm } from '@/types';

export default function TrendingPage() {
  const { data: firms = [], isLoading } = useQuery({
    queryKey: ['firms', 'trending'],
    queryFn: () => firmApi.trending().then(r => r.data),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold">Trending Prop Firms</h1>
        </div>
        <p className="text-muted-foreground">Based on views, clicks, reviews, and trader engagement</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {firms.map((firm: PropFirm, i: number) => (
            <div key={firm.id} className="relative">
              <div className="absolute -top-2 -right-2 z-10 flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                <TrendingUp className="h-3 w-3" /> #{i + 1}
              </div>
              <FirmCard firm={firm} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
