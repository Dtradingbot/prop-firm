'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { PropFirm, Review } from '@/types';
import { Star, Shield, ExternalLink, Copy, ChevronDown, ChevronUp, GitCompare } from 'lucide-react';
import { formatCurrency, formatDate, getTrustScoreClass, getAffiliateUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ReviewSection } from '@/components/firms/ReviewSection';

interface Props { firm: PropFirm }

export function FirmDetailClient({ firm }: Props) {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const activeOffer = firm.offers?.[0];

  const copyCoupon = () => {
    if (activeOffer?.couponCode) {
      navigator.clipboard.writeText(activeOffer.couponCode);
      toast.success('Coupon code copied!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/firms" className="hover:text-foreground">Firms</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{firm.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start gap-5">
              <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {firm.logo
                  ? <Image src={firm.logo} alt={firm.name} width={96} height={96} className="object-contain" />
                  : <span className="text-3xl font-bold text-muted-foreground">{firm.name[0]}</span>
                }
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">{firm.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={cn('h-4 w-4', i <= Math.round(firm.averageRating)
                        ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
                      )} />
                    ))}
                    <span className="font-semibold ml-1">{firm.averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground text-sm">({firm.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    <span className={cn('text-sm font-medium', getTrustScoreClass(firm.trustScore))}>
                      Trust: {firm.trustScore}/100
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{firm.shortDescription}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Max Funding', value: firm.maxFundingSize ? formatCurrency(firm.maxFundingSize) : '—' },
              { label: 'Profit Split', value: firm.profitSplit ? `${firm.profitSplit}%` : '—' },
              { label: 'Daily Drawdown', value: firm.maxDailyDrawdown ? `${firm.maxDailyDrawdown}%` : '—' },
              { label: 'Max Drawdown', value: firm.maxTotalDrawdown ? `${firm.maxTotalDrawdown}%` : '—' },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                <div className="text-xl font-bold">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          {firm.description && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-3">About {firm.name}</h2>
              <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                {firm.description}
              </div>
            </div>
          )}

          {/* Funding Programs */}
          {firm.fundingPrograms && firm.fundingPrograms.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">Funding Programs</h2>
              <div className="space-y-4">
                {firm.fundingPrograms.map(prog => (
                  <div key={prog.id} className="border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{prog.name}</h3>
                      <span className="text-sm font-bold text-green-600">{prog.profitSplit}% split</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {prog.accountSizes.map((size: number) => (
                        <span key={size} className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                          {formatCurrency(size)}
                        </span>
                      ))}
                    </div>
                    {prog.fee && <p className="text-sm text-muted-foreground mt-2">Entry fee: ${prog.fee}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules */}
          {firm.rules && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-3">Trading Rules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {Object.entries(firm.rules as Record<string, string>).map(([key, val]) => (
                  <div key={key} className="flex justify-between gap-2 p-2.5 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          {firm.faqs && firm.faqs.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-2">
                {firm.faqs.map(faq => (
                  <div key={faq.id} className="border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-accent transition-colors"
                    >
                      <span className="font-medium text-sm">{faq.question}</span>
                      {openFaq === faq.id ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                    </button>
                    {openFaq === faq.id && (
                      <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <ReviewSection firmId={firm.id} firmName={firm.name} />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* CTA Card */}
          <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
            <div className="text-center mb-5">
              {activeOffer?.discount && (
                <div className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold px-3 py-1 rounded-full mb-3">
                  {activeOffer.discount}% OFF with coupon!
                </div>
              )}
              {activeOffer?.couponCode && (
                <div className="flex items-center gap-2 p-3 bg-muted border border-dashed border-border rounded-xl mb-4">
                  <span className="font-mono font-bold flex-1">{activeOffer.couponCode}</span>
                  <button onClick={copyCoupon} className="text-primary">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <a
              href={getAffiliateUrl(firm.slug, 'firm_page')}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Visit {firm.name} <ExternalLink className="h-4 w-4" />
            </a>
            <Link
              href={`/compare?firms=${firm.slug}`}
              className="flex items-center justify-center gap-2 w-full py-3 mt-2 border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors"
            >
              <GitCompare className="h-4 w-4" /> Compare
            </Link>
          </div>

          {/* Firm Details */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-4">Firm Details</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Founded', value: firm.founded },
                { label: 'Country', value: firm.country },
                { label: 'Broker', value: firm.broker?.name },
                { label: 'Evaluation', value: firm.evaluationType?.replace('_', '-') },
                { label: 'Payout', value: firm.payoutFrequency },
                { label: 'Platforms', value: firm.platforms.join(', ') },
              ].filter(i => i.value).map(item => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{String(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Offers */}
          {firm.offers && firm.offers.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold mb-3">Active Offers</h3>
              <div className="space-y-3">
                {firm.offers.map(offer => (
                  <div key={offer.id} className="p-3 bg-muted/50 rounded-xl">
                    <div className="font-medium text-sm mb-1">{offer.title}</div>
                    {offer.couponCode && (
                      <code className="text-xs bg-background px-2 py-0.5 rounded border">{offer.couponCode}</code>
                    )}
                    {offer.expiresAt && (
                      <p className="text-xs text-muted-foreground mt-1">Expires {formatDate(offer.expiresAt)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
