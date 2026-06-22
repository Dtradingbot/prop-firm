'use client';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { firmApi } from '@/lib/api';
import { FirmCard } from '@/components/firms/FirmCard';
import { FirmFilters } from '@/components/firms/FirmFilters';
import { SlidersHorizontal, Grid, List } from 'lucide-react';
import { PropFirm } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FirmsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'averageRating',
    broker: searchParams.get('broker') || '',
    platform: searchParams.get('platform') || '',
    evaluationType: searchParams.get('evaluationType') || '',
    instantFunding: searchParams.get('instantFunding') || '',
    page: '1',
  });

  const [compareList, setCompareList] = useState<PropFirm[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['firms', filters],
    queryFn: () => firmApi.list(filters).then(r => r.data),
  });

  const toggleCompare = useCallback((firm: PropFirm) => {
    setCompareList(prev => {
      if (prev.find(f => f.id === firm.id)) return prev.filter(f => f.id !== firm.id);
      if (prev.length >= 4) return prev;
      return [...prev, firm];
    });
  }, []);

  const goCompare = () => {
    const slugs = compareList.map(f => f.slug).join(',');
    router.push(`/compare?firms=${slugs}`);
  };

  const sortOptions = [
    { value: 'averageRating', label: 'Highest Rated' },
    { value: 'trending', label: 'Trending' },
    { value: 'reviews', label: 'Most Reviews' },
    { value: 'newest', label: 'Newest' },
    { value: 'funding', label: 'Highest Funding' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Prop Firm Directory</h1>
        <p className="text-muted-foreground">Compare {data?.total || '...'} prop trading firms</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>

        <select
          value={filters.sort}
          onChange={e => setFilters(p => ({ ...p, sort: e.target.value }))}
          className="px-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
            <Grid className="h-4 w-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        {filterOpen && (
          <aside className="w-72 shrink-0">
            <FirmFilters filters={filters} onFilterChange={f => setFilters(p => ({ ...p, ...f, page: '1' }))} />
          </aside>
        )}

        {/* Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(9)].map((_, i) => <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                : 'flex flex-col gap-4'
              }>
                {data?.firms?.map((firm: PropFirm) => (
                  <FirmCard
                    key={firm.id}
                    firm={firm}
                    showCompare
                    onCompare={toggleCompare}
                    isSelected={compareList.some(f => f.id === firm.id)}
                  />
                ))}
              </div>

              {data?.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {[...Array(data.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFilters(p => ({ ...p, page: String(i + 1) }))}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        filters.page === String(i + 1)
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border hover:bg-accent'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Compare bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-2xl shadow-2xl p-4 flex items-center gap-4">
          <div className="flex gap-2">
            {compareList.map(f => (
              <div key={f.id} className="text-sm font-medium px-3 py-1.5 bg-primary/10 rounded-lg text-primary">
                {f.name}
              </div>
            ))}
          </div>
          <button
            onClick={goCompare}
            className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors"
          >
            Compare ({compareList.length})
          </button>
          <button onClick={() => setCompareList([])} className="text-muted-foreground hover:text-foreground text-sm">
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
