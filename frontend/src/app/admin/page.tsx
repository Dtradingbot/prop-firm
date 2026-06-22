'use client';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';
import { Building2, Star, Tag, MousePointerClick, MessageSquare, TrendingUp } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-3xl font-bold">{value?.toLocaleString() ?? '—'}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => analyticsApi.dashboard().then(r => r.data),
  });

  const { data: topFirms = [] } = useQuery({
    queryKey: ['admin', 'top-firms'],
    queryFn: () => analyticsApi.topFirms().then(r => r.data),
  });

  if (isLoading) return <div className="text-muted-foreground">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Firms" value={data?.totalFirms} icon={Building2} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
        <StatCard label="Total Reviews" value={data?.totalReviews} icon={Star} color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" />
        <StatCard label="Active Offers" value={data?.totalOffers} icon={Tag} color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
        <StatCard label="Total Clicks" value={data?.totalClicks} icon={MousePointerClick} color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
        <StatCard label="Pending Reviews" value={data?.pendingReviews} icon={MessageSquare} color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Firms */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Top Performing Firms
          </h2>
          <div className="space-y-3">
            {topFirms.map((firm: any, i: number) => (
              <div key={firm.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{firm.name}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{firm.clickCount} clicks</span>
                    <span>{firm.viewCount} views</span>
                    <span>★ {firm.averageRating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(100, (firm.clickCount / (topFirms[0]?.clickCount || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Clicks */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-bold mb-4">Recent Affiliate Clicks</h2>
          <div className="space-y-2">
            {data?.recentClicks?.slice(0, 8).map((click: any) => (
              <div key={click.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                <div>
                  <span className="font-medium">{click.firm?.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{click.source}</span>
                </div>
                <div className="text-xs text-muted-foreground">{click.device} • {click.country}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
