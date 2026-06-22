'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { compareApi, firmApi } from '@/lib/api';
import { FirmCard } from '@/components/firms/FirmCard';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import { Check, X, Plus } from 'lucide-react';
import { PropFirm } from '@/types';

const compareFields = [
  { key: 'maxFundingSize', label: 'Max Funding', format: (v: any) => v ? formatCurrency(v) : '—' },
  { key: 'minFundingSize', label: 'Min Funding', format: (v: any) => v ? formatCurrency(v) : '—' },
  { key: 'profitSplit', label: 'Profit Split', format: (v: any) => v ? `${v}%` : '—' },
  { key: 'maxDailyDrawdown', label: 'Daily Drawdown', format: (v: any) => v ? `${v}%` : '—' },
  { key: 'maxTotalDrawdown', label: 'Max Drawdown', format: (v: any) => v ? `${v}%` : '—' },
  { key: 'drawdownType', label: 'Drawdown Type', format: (v: any) => v || '—' },
  { key: 'evaluationType', label: 'Evaluation', format: (v: any) => v?.replace('_', '-') || '—' },
  { key: 'instantFunding', label: 'Instant Funding', format: (v: any) => v ? '✓ Yes' : '✗ No', highlight: true },
  { key: 'tradingFee', label: 'Trading Fee', format: (v: any) => v ? `$${v}` : 'Free' },
  { key: 'payoutFrequency', label: 'Payout', format: (v: any) => v || '—' },
  { key: 'country', label: 'Country', format: (v: any) => v || '—' },
  { key: 'averageRating', label: 'Rating', format: (v: any) => v ? `★ ${v.toFixed(1)}` : '—' },
  { key: 'trustScore', label: 'Trust Score', format: (v: any) => v ? `${v}/100` : '—' },
];

function ComparePageInner() {
  const searchParams = useSearchParams();
  const firmSlugs = searchParams.get('firms')?.split(',').filter(Boolean) || [];
  const [slugs, setSlugs] = useState<string[]>(firmSlugs);
  const [firmSearch, setFirmSearch] = useState('');

  const { data: firms = [], isLoading } = useQuery({
    queryKey: ['compare', slugs],
    queryFn: () => slugs.length >= 1 ? compareApi.compare(slugs).then(r => r.data) : Promise.resolve([]),
    enabled: slugs.length >= 1,
  });

  const { data: searchResults } = useQuery({
    queryKey: ['firm-search', firmSearch],
    queryFn: () => firmSearch.length >= 2
      ? firmApi.list({ search: firmSearch }).then(r => r.data.firms)
      : Promise.resolve([]),
  });

  const addFirm = (slug: string) => {
    if (!slugs.includes(slug) && slugs.length < 4) setSlugs(p => [...p, slug]);
    setFirmSearch('');
  };

  const removeFirm = (slug: string) => setSlugs(p => p.filter(s => s !== slug));

  const getBest = (key: string) => {
    const values = firms.map((f: any) => f[key]).filter(v => v !== null && v !== undefined);
    if (!values.length) return null;
    if (key === 'maxFundingSize' || key === 'profitSplit' || key === 'averageRating' || key === 'trustScore') {
      return Math.max(...values.map(Number));
    }
    if (key === 'maxDailyDrawdown' || key === 'maxTotalDrawdown' || key === 'tradingFee') {
      return Math.min(...values.map(Number));
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Compare Prop Firms</h1>
        <p className="text-muted-foreground">Select up to 4 prop firms to compare side by side</p>
      </div>

      {/* Add firm search */}
      {slugs.length < 4 && (
        <div className="relative max-w-md mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Add a firm to compare..."
                value={firmSearch}
                onChange={e => setFirmSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-input rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          {firmSearch.length >= 2 && searchResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-10">
              {searchResults.slice(0, 6).map((firm: PropFirm) => (
                <button
                  key={firm.id}
                  onClick={() => addFirm(firm.slug)}
                  disabled={slugs.includes(firm.slug)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent text-sm text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {firm.logo && <Image src={firm.logo} alt={firm.name} width={24} height={24} className="rounded" />}
                  <span>{firm.name}</span>
                  {slugs.includes(firm.slug) && <Check className="h-4 w-4 text-primary ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {firms.length === 0 && !isLoading && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg mb-2">No firms selected for comparison</p>
          <p className="text-sm">Search and add firms above to start comparing</p>
        </div>
      )}

      {firms.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-4 pr-4 w-48 font-semibold text-muted-foreground text-sm">Feature</th>
                {firms.map((firm: PropFirm) => (
                  <th key={firm.id} className="text-center px-4 py-4 min-w-[200px]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden">
                        {firm.logo
                          ? <Image src={firm.logo} alt={firm.name} width={48} height={48} className="object-contain" />
                          : <span className="text-lg font-bold text-muted-foreground flex items-center justify-center h-full">{firm.name[0]}</span>
                        }
                      </div>
                      <span className="font-bold text-sm">{firm.name}</span>
                      <button
                        onClick={() => removeFirm(firm.slug)}
                        className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                      >
                        <X className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareFields.map((field, idx) => {
                const best = getBest(field.key);
                return (
                  <tr key={field.key} className={idx % 2 === 0 ? 'bg-muted/20' : ''}>
                    <td className="py-3 pr-4 text-sm font-medium text-muted-foreground">{field.label}</td>
                    {firms.map((firm: any) => {
                      const val = firm[field.key];
                      const isBest = best !== null && val !== null && val !== undefined && Number(val) === Number(best);
                      return (
                        <td key={firm.id} className="py-3 px-4 text-center">
                          <span className={`text-sm font-medium ${isBest ? 'text-green-600 dark:text-green-400 font-bold' : ''}`}>
                            {field.format(val)}
                          </span>
                          {isBest && <span className="ml-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full">Best</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr>
                <td className="py-4 pr-4 text-sm font-medium text-muted-foreground">Visit</td>
                {firms.map((firm: PropFirm) => (
                  <td key={firm.id} className="py-4 px-4 text-center">
                    <a
                      href={`/go/${firm.slug}?source=compare`}
                      className="inline-block px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:bg-primary/90 transition-colors"
                    >
                      Visit Site
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <ComparePageInner />
    </Suspense>
  );
}
