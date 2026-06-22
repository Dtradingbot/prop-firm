'use client';
import { useQuery } from '@tanstack/react-query';
import { brokerApi } from '@/lib/api';

interface FiltersState {
  search: string;
  broker: string;
  platform: string;
  evaluationType: string;
  instantFunding: string;
}

interface FirmFiltersProps {
  filters: FiltersState;
  onFilterChange: (f: Partial<FiltersState>) => void;
}

const platforms = ['MT4', 'MT5', 'cTrader', 'TradingView', 'NinjaTrader', 'Rithmic'];
const evalTypes = [
  { value: '', label: 'All Types' },
  { value: 'ONE_STEP', label: '1-Step' },
  { value: 'TWO_STEP', label: '2-Step' },
  { value: 'THREE_STEP', label: '3-Step' },
  { value: 'INSTANT', label: 'Instant Funding' },
];

export function FirmFilters({ filters, onFilterChange }: FirmFiltersProps) {
  const { data: brokers = [] } = useQuery({
    queryKey: ['brokers'],
    queryFn: () => brokerApi.list().then(r => r.data),
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-5 sticky top-24">
      <h3 className="font-semibold">Filters</h3>

      {/* Search */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Search</label>
        <input
          type="text"
          placeholder="Firm name..."
          value={filters.search}
          onChange={e => onFilterChange({ search: e.target.value })}
          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Broker */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Broker</label>
        <select
          value={filters.broker}
          onChange={e => onFilterChange({ broker: e.target.value })}
          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Brokers</option>
          {brokers.map((b: any) => <option key={b.id} value={b.slug}>{b.name}</option>)}
        </select>
      </div>

      {/* Platform */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Platform</label>
        <div className="flex flex-wrap gap-2">
          {platforms.map(p => (
            <button
              key={p}
              onClick={() => onFilterChange({ platform: filters.platform === p ? '' : p })}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filters.platform === p
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:border-primary'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Evaluation Type */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Evaluation Type</label>
        <div className="space-y-1.5">
          {evalTypes.map(e => (
            <label key={e.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="evalType"
                value={e.value}
                checked={filters.evaluationType === e.value}
                onChange={() => onFilterChange({ evaluationType: e.value })}
                className="accent-primary"
              />
              <span className="text-sm">{e.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Instant Funding */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.instantFunding === 'true'}
            onChange={e => onFilterChange({ instantFunding: e.target.checked ? 'true' : '' })}
            className="accent-primary rounded"
          />
          <span className="text-sm font-medium">Instant Funding Only</span>
        </label>
      </div>

      <button
        onClick={() => onFilterChange({ search: '', broker: '', platform: '', evaluationType: '', instantFunding: '' })}
        className="w-full py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-accent transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}
