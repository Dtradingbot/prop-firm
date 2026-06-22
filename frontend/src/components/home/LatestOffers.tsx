'use client';
import { useQuery } from '@tanstack/react-query';
import { offerApi } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { Tag, Copy, ExternalLink, Clock } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Offer } from '@/types';

export function LatestOffers() {
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: () => offerApi.list().then(r => r.data.slice(0, 6)),
  });

  if (isLoading || !offers.length) return null;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied!');
  };

  return (
    <section className="bg-muted/30 py-14">
      <div className="container mx-auto px-4">
        <SectionHeader
          icon={<Tag className="h-5 w-5 text-green-500" />}
          title="Latest Offers & Discounts"
          subtitle="Exclusive coupon codes and discounts from top prop firms"
          href="/offers"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {offers.map((offer: Offer) => (
            <div key={offer.id} className="bg-card border border-border rounded-2xl p-5 card-hover">
              <div className="flex items-center gap-3 mb-3">
                {offer.firm?.logo && (
                  <Image src={offer.firm.logo} alt={offer.firm.name || ''} width={36} height={36} className="rounded-lg object-contain" />
                )}
                <div>
                  <Link href={`/firms/${offer.firm?.slug}`} className="font-semibold text-sm hover:text-primary">
                    {offer.firm?.name}
                  </Link>
                  {offer.discount && (
                    <div className="text-xs font-bold text-green-600 dark:text-green-400">{offer.discount}% OFF</div>
                  )}
                </div>
              </div>

              <h3 className="font-semibold mb-2">{offer.title}</h3>
              {offer.description && <p className="text-sm text-muted-foreground mb-3">{offer.description}</p>}

              {offer.couponCode && (
                <div className="flex items-center gap-2 p-2.5 bg-green-50 dark:bg-green-900/20 border border-dashed border-green-300 dark:border-green-700 rounded-lg mb-3">
                  <span className="font-mono font-bold text-green-700 dark:text-green-400 flex-1 text-sm">
                    {offer.couponCode}
                  </span>
                  <button onClick={() => copyCode(offer.couponCode!)} className="text-green-600">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                {offer.expiresAt && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Expires {formatDate(offer.expiresAt)}
                  </div>
                )}
                <a
                  href={offer.affiliateUrl}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline ml-auto"
                >
                  Claim <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
