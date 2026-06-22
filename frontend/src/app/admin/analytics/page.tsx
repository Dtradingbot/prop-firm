'use client';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';
import { MousePointerClick, Eye, Globe, Smartphone, Monitor, TrendingUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => analyticsApi.dashboard().then(r => r.data),
  });

  const { data: topFirms = [] } = useQuery({
    queryKey: ['admin', 'top-firms'],
    queryFn: () => analyticsApi.topFirms().then(r => r.data),
  });

  if (isLoading) return <div className="text-muted-foreground">Loading analytics...</div>;

  // Compute device breakdown from recent clicks
  const clicks = data?.recentClicks || [];
  const mobile = clicks.filter((c: any) => c.device === 'mobile').length;
  const desktop = clicks.filter((c: any) => c.device === 'desktop').length;
  const total = clicks.length || 1;

  // Source breakdown
  const sources = clicks.reduce((acc: Record<string, number>, c: any) => {
    acc[c.source] = (acc[c.source] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Clicks', value: data?.totalClicks, icon: MousePointerClick, color: 'text-blue-500' },
          { label: 'Total Firms', value: data?.totalFirms, icon: Globe, color: 'text-green-500' },
          { label: 'Total Reviews', value: data?.totalReviews, icon: Eye, color: 'text-yellow-500' },
          { label: 'Pending Reviews', value: data?.pendingReviews, icon: TrendingUp, color: 'text-red-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold">{stat.value?.toLocaleString() ?? '—'}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Device Breakdown */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-bold mb-4">Device Breakdown (Last 100 Clicks)</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2"><Monitor className="h-4 w-4" /> Desktop</div>
                <span className="font-medium">{desktop} ({Math.round(desktop/total*100)}%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(desktop/total)*100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2"><Smartphone className="h-4 w-4" /> Mobile</div>
                <span className="font-medium">{mobile} ({Math.round(mobile/total*100)}%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(mobile/total)*100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Click Sources */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-bold mb-4">Click Sources</h2>
          <div className="space-y-3">
            {Object.entries(sources).sort(([,a],[,b]) => (b as number)-(a as number)).map(([source, count]) => (
              <div key={source}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{source.toLowerCase().replace('_', ' ')}</span>
                  <span className="font-medium">{count as number} ({Math.round((count as number)/total*100)}%)</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${((count as number)/total)*100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Firms Table */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-bold mb-4">Top Performing Firms by Clicks</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-sm font-semibold text-muted-foreground">Rank</th>
                <th className="text-left py-2 text-sm font-semibold text-muted-foreground">Firm</th>
                <th className="text-left py-2 text-sm font-semibold text-muted-foreground">Clicks</th>
                <th className="text-left py-2 text-sm font-semibold text-muted-foreground">Views</th>
                <th className="text-left py-2 text-sm font-semibold text-muted-foreground">Rating</th>
                <th className="text-left py-2 text-sm font-semibold text-muted-foreground">CTR</th>
              </tr>
            </thead>
            <tbody>
              {topFirms.map((firm: any, i: number) => (
                <tr key={firm.id} className="border-b border-border last:border-0">
                  <td className="py-3 text-sm font-bold text-muted-foreground">#{i+1}</td>
                  <td className="py-3 font-medium text-sm">{firm.name}</td>
                  <td className="py-3 text-sm">{firm.clickCount.toLocaleString()}</td>
                  <td className="py-3 text-sm">{firm.viewCount.toLocaleString()}</td>
                  <td className="py-3 text-sm">★ {firm.averageRating.toFixed(1)}</td>
                  <td className="py-3 text-sm">
                    {firm.viewCount > 0 ? `${((firm.clickCount / firm.viewCount) * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Clicks Feed */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-bold mb-4">Recent Click Activity</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {clicks.slice(0, 30).map((click: any) => (
            <div key={click.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
              <div className="flex items-center gap-3">
                <MousePointerClick className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="font-medium">{click.firm?.name}</span>
                <span className="text-muted-foreground text-xs">{click.source}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground text-xs">
                <span>{click.device}</span>
                {click.country && <span>{click.country}</span>}
                <span>{formatDate(click.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
