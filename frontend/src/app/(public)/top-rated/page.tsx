'use client';
import { useQuery } from '@tanstack/react-query';
import { firmApi } from '@/lib/api';
import { FirmCard } from '@/components/firms/FirmCard';
import { Star, Trophy } from 'lucide-react';
import { PropFirm } from '@/types';

export default function TopRatedPage() {
  const { data: firms = [], isLoading } = useQuery({
    queryKey: ['firms', 'top-rated'],
    queryFn: () => firmApi.topRated().then(r => r.data),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
            <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold">Top Rated Prop Firms</h1>
        </div>
        <p className="text-muted-foreground">Ranked by community reviews and verified trader ratings</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div>
          {/* Top 3 podium */}
          {firms.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {[firms[1], firms[0], firms[2]].map((firm: PropFirm, i) => (
                <div key={firm?.id} className={`${i === 1 ? 'md:-mt-4 order-first md:order-none' : ''}`}>
                  <div className={`text-center mb-2 font-bold ${i === 1 ? 'text-2xl text-yellow-500' : 'text-lg text-muted-foreground'}`}>
                    {i === 1 ? '🥇 #1' : i === 0 ? '🥈 #2' : '🥉 #3'}
                  </div>
                  <FirmCard firm={firm} />
                </div>
              ))}
            </div>
          )}

          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">All Top Rated Firms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {firms.map((firm: PropFirm, i: number) => (
              <div key={firm.id} className="relative">
                <div className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow">
                  {i + 1}
                </div>
                <FirmCard firm={firm} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
