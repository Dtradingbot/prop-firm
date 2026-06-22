'use client';
import { useQuery } from '@tanstack/react-query';
import { brokerApi } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { Building2, ExternalLink } from 'lucide-react';

export default function BrokersPage() {
  const { data: brokers = [], isLoading } = useQuery({
    queryKey: ['brokers'],
    queryFn: () => brokerApi.list().then(r => r.data),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold">Broker Directory</h1>
        </div>
        <p className="text-muted-foreground">Regulated brokers powering the top prop trading firms</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {brokers.map((broker: any) => (
            <Link key={broker.id} href={`/brokers/${broker.slug}`} className="block bg-card border border-border rounded-2xl p-6 card-hover">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {broker.logo
                    ? <Image src={broker.logo} alt={broker.name} width={64} height={64} className="object-contain" />
                    : <span className="text-xl font-bold text-muted-foreground">{broker.name[0]}</span>
                  }
                </div>
                <div>
                  <h2 className="font-bold text-lg">{broker.name}</h2>
                  {broker.regulation && <p className="text-xs text-muted-foreground">{broker.regulation}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                      {broker._count?.firms} firms
                    </span>
                    <span className="text-xs text-muted-foreground">★ {broker.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              {broker.description && <p className="text-sm text-muted-foreground line-clamp-2">{broker.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
