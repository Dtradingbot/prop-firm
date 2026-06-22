'use client';
import { useQuery } from '@tanstack/react-query';
import { blogApi } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Calendar, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { BlogPost } from '@/types';

export default function BlogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['blog'],
    queryFn: () => blogApi.list().then(r => r.data),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold">Trading Blog</h1>
        </div>
        <p className="text-muted-foreground">Guides, reviews, and insights for prop traders</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-72 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : data?.posts?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No blog posts yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.posts?.map((post: BlogPost) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="block bg-card border border-border rounded-2xl overflow-hidden card-hover">
              {post.featuredImage && (
                <div className="relative h-48 bg-muted">
                  <Image src={post.featuredImage} alt={post.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-5">
                {post.category && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium mb-2 inline-block">
                    {post.category.name}
                  </span>
                )}
                <h2 className="font-bold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.publishedAt ? formatDate(post.publishedAt) : ''}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {post.viewCount} views
                  </div>
                  <span className="ml-auto font-medium">{post.author?.username}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
