'use client';
import Link from 'next/link';
import { ArrowRight, Search, Star, TrendingUp, Shield } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const stats = [
  { label: 'Prop Firms', value: '100+' },
  { label: 'Reviews', value: '10K+' },
  { label: 'Traders Helped', value: '50K+' },
  { label: 'Countries', value: '50+' },
];

export function HeroBanner() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/firms?search=${encodeURIComponent(search)}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-950/50" />

      <div className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-800/50 border border-blue-600/50 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
            <span>The #1 Prop Firm Comparison Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Find the <span className="text-yellow-400">Perfect Prop Firm</span> for Your Trading Career
          </h1>

          <p className="text-lg md:text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
            Compare 100+ prop firms side by side. Profit splits, drawdown rules, fees, and exclusive discount codes — all in one place.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
              <input
                type="text"
                placeholder="Search prop firms..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-4 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold rounded-xl transition-colors flex items-center gap-2 shrink-0"
            >
              Search <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {['FTMO', 'MyForexFunds', 'TopStep', 'E8 Funding', 'Apex Trader'].map(firm => (
              <Link
                key={firm}
                href={`/firms?search=${firm}`}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-sm transition-colors"
              >
                {firm}
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold text-yellow-400">{stat.value}</div>
                <div className="text-sm text-blue-300 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="relative border-t border-white/10 bg-blue-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-blue-300">
            <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-green-400" /> Independent Reviews</div>
            <div className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-400" /> Verified Ratings</div>
            <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-blue-400" /> Real-time Data</div>
          </div>
        </div>
      </div>
    </section>
  );
}
