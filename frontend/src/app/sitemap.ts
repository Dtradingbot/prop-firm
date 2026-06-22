import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://couponen.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/firms`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/brokers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/offers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/top-rated`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/trending`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
  ];

  try {
    const [firmsRes, brokersRes, blogRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/firms?limit=200`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/brokers`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog?limit=100`).then(r => r.json()),
    ]);

    const firmRoutes: MetadataRoute.Sitemap = (firmsRes.firms || []).map((f: any) => ({
      url: `${BASE_URL}/firms/${f.slug}`,
      lastModified: new Date(f.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const brokerRoutes: MetadataRoute.Sitemap = (brokersRes || []).map((b: any) => ({
      url: `${BASE_URL}/brokers/${b.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const blogRoutes: MetadataRoute.Sitemap = (blogRes.posts || []).map((p: any) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

    return [...staticRoutes, ...firmRoutes, ...brokerRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
