import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Eye, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';

async function getPost(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/${slug}`, { next: { revalidate: 600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/blog" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Blog
      </Link>

      {post.featuredImage && (
        <div className="relative h-72 md:h-96 bg-muted rounded-2xl overflow-hidden mb-8">
          <Image src={post.featuredImage} alt={post.title} fill className="object-cover" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        {post.category && (
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
            {post.category.name}
          </span>
        )}
        {post.tags?.map((tag: any) => (
          <span key={tag.id} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            #{tag.name}
          </span>
        ))}
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">{post.title}</h1>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {post.author?.username?.[0]?.toUpperCase()}
          </div>
          <span>{post.author?.username}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {post.publishedAt ? formatDate(post.publishedAt) : ''}
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {post.viewCount} views
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
        {post.body}
      </div>
    </div>
  );
}
