import Link from 'next/link';
import Image from 'next/image';
import { Star, TrendingUp, Shield, ExternalLink, Copy } from 'lucide-react';
import { PropFirm } from '@/types';
import { formatCurrency, getAffiliateUrl, getTrustScoreClass } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface FirmCardProps {
  firm: PropFirm;
  showCompare?: boolean;
  onCompare?: (firm: PropFirm) => void;
  isSelected?: boolean;
}

export function FirmCard({ firm, showCompare, onCompare, isSelected }: FirmCardProps) {
  const coupon = firm.offers?.[0]?.couponCode;

  const copyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    if (coupon) {
      navigator.clipboard.writeText(coupon);
      toast.success('Coupon copied!');
    }
  };

  return (
    <div className={cn(
      'relative bg-card border border-border rounded-2xl overflow-hidden card-hover',
      isSelected && 'ring-2 ring-primary',
    )}>
      {firm.isFeatured && (
        <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
          Featured
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {firm.logo ? (
              <Image src={firm.logo} alt={firm.name} width={56} height={56} className="object-contain" />
            ) : (
              <span className="text-xl font-bold text-muted-foreground">{firm.name[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/firms/${firm.slug}`} className="font-bold text-base hover:text-primary transition-colors line-clamp-1">
              {firm.name}
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">{firm.averageRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({firm.reviewCount})</span>
              </div>
              {firm.broker && (
                <span className="text-xs text-muted-foreground">• {firm.broker.name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Trust Score */}
        <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-xl">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Trust Score</span>
          </div>
          <span className={cn('text-sm font-bold', getTrustScoreClass(firm.trustScore))}>
            {firm.trustScore}/100
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2.5 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground">Max Funding</div>
            <div className="font-bold text-sm mt-0.5">{firm.maxFundingSize ? formatCurrency(firm.maxFundingSize) : '—'}</div>
          </div>
          <div className="text-center p-2.5 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground">Profit Split</div>
            <div className="font-bold text-sm mt-0.5">{firm.profitSplit ? `${firm.profitSplit}%` : '—'}</div>
          </div>
          <div className="text-center p-2.5 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground">Daily DD</div>
            <div className="font-bold text-sm mt-0.5">{firm.maxDailyDrawdown ? `${firm.maxDailyDrawdown}%` : '—'}</div>
          </div>
          <div className="text-center p-2.5 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground">Max DD</div>
            <div className="font-bold text-sm mt-0.5">{firm.maxTotalDrawdown ? `${firm.maxTotalDrawdown}%` : '—'}</div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            firm.instantFunding
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-muted text-muted-foreground'
          )}>
            {firm.instantFunding ? '⚡ Instant' : firm.evaluationType?.replace('_', '-')}
          </span>
          {firm.platforms.slice(0, 2).map(p => (
            <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
              {p}
            </span>
          ))}
        </div>

        {/* Coupon */}
        {coupon && (
          <div className="mb-4 flex items-center gap-2 p-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <span className="text-xs text-green-700 dark:text-green-400 font-medium flex-1">
              {firm.offers?.[0]?.discount && `${firm.offers[0].discount}% OFF`} • Code: <span className="font-bold">{coupon}</span>
            </span>
            <button onClick={copyCoupon} className="text-green-600 hover:text-green-700">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={getAffiliateUrl(firm.slug, 'directory')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors"
          >
            Visit Website <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {showCompare && (
            <button
              onClick={() => onCompare?.(firm)}
              className={cn(
                'px-3 py-2.5 rounded-xl border font-semibold text-sm transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:border-primary hover:text-primary'
              )}
            >
              {isSelected ? '✓' : '+'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
