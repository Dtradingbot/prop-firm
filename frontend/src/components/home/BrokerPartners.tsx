'use client';
import { useQuery } from '@tanstack/react-query';
import { brokerApi } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { SectionHeader } from './SectionHeader';
import { Building2 } from 'lucide-react';

export function BrokerPartners() {
  const { data: brokers = [], isLoading } = useQuery({
    queryKey: ['brokers'],
    queryFn: () => brokerApi.list().then(r => r.data.slice(0, 8)),
  });

  if (isLoading || !brokers.length) return null;

  return (
    <section className="container mx-auto px-4 py-14">
      <SectionHeader
        icon={<Building2 className="h-5 w-5 text-blue-500" />}
        title="Broker Partners"
        subtitle="Trusted brokers powering the top prop trading firms"
        href="/brokers"
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mt-8">
        {brokers.map((broker: any) => (
          <Link
            key={broker.id}
            href={`/brokers/${broker.slug}`}
            className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all gap-2"
          >
            {broker.logo ? (
              <Image src={broker.logo} alt={broker.name} width={48} height={48} className="object-contain h-12" />
            ) : (
              <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center font-bold text-muted-foreground">
                {broker.name[0]}
              </div>
            )}
            <span className="text-xs font-medium text-center">{broker.name}</span>
            <span className="text-xs text-muted-foreground">{broker._count?.firms} firms</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
