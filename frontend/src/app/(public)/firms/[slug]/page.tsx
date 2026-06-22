import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FirmDetailClient } from './FirmDetailClient';

async function getFirm(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/firms/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const firm = await getFirm(params.slug);
  if (!firm) return { title: 'Firm Not Found' };
  return {
    title: firm.metaTitle || `${firm.name} Review & Discount Codes`,
    description: firm.metaDescription || firm.shortDescription,
    openGraph: { images: firm.ogImage ? [firm.ogImage] : [] },
  };
}

export default async function FirmPage({ params }: { params: { slug: string } }) {
  const firm = await getFirm(params.slug);
  if (!firm) notFound();
  return <FirmDetailClient firm={firm} />;
}
