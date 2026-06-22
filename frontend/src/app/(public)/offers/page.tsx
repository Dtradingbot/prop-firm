'use client';
import { useQuery } from '@tanstack/react-query';
import { offerApi } from '@/lib/api';
import { Tag, Copy, ExternalLink, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Offer } from '@/types';
import toast from 'react-hot-toast';

export default function OffersPage() {
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: () => offerApi.list().then(r => r.data),
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Copied!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
            <Tag className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold">Prop Firm Offers & Discounts</h1>
        </div>
        <p className="text-muted-foreground">Exclusive coupon codes and limited-time discounts</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-56 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map((offer: Offer) => (
            <div key={offer.id} className="bg-card border border-border rounded-2xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-4">
                {offer.firm?.logo && (
                  <Image src={offer.firm.logo} alt={offer.firm.name || ''} width={48} height={48} className="rounded-xl object-contain" />
                )}
                <div>
                  <Link href={`/firms/${offer.firm?.slug}`} className="font-bold hover:text-primary transition-colors">
                    {offer.firm?.name}
                  </Link>
                  {offer.discount && (
                    <div className="inline-flex ml-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">
                      {offer.discount}% OFF
                    </div>
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2">{offer.title}</h3>
              {offer.description && <p className="text-sm text-muted-foreground mb-4">{offer.description}</p>}

              {offer.couponCode && (
                <div className="flex items-center gap-2 p-3 bg-muted border-2 border-dashed border-border rounded-xl mb-4">
                  <code className="font-mono font-bold text-primary flex-1 text-sm">{offer.couponCode}</code>
                  <button
                    onClick={() => copyCode(offer.couponCode!)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                {offer.expiresAt && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Expires {formatDate(offer.expiresAt)}
                  </div>
                )}
                <a
                  href={offer.affiliateUrl}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:bg-primary/90 transition-colors ml-auto"
                >
                  Claim Offer <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
