import type { Metadata } from 'next';
import { HeroBanner } from '@/components/home/HeroBanner';
import { FeaturedFirms } from '@/components/home/FeaturedFirms';
import { TopRatedFirms } from '@/components/home/TopRatedFirms';
import { TrendingFirms } from '@/components/home/TrendingFirms';
import { LatestOffers } from '@/components/home/LatestOffers';
import { BrokerPartners } from '@/components/home/BrokerPartners';
import { CompareToolCTA } from '@/components/home/CompareToolCTA';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { StatsBar } from '@/components/home/StatsBar';

export const metadata: Metadata = {
  title: 'PropFirmHub — Compare Prop Firms & Find the Best Deals',
  description: 'Compare 100+ prop trading firms. Find the best funding, profit splits, and exclusive coupon codes.',
};

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <StatsBar />
      <FeaturedFirms />
      <TopRatedFirms />
      <CompareToolCTA />
      <TrendingFirms />
      <LatestOffers />
      <BrokerPartners />
      <NewsletterSection />
    </>
  );
}
