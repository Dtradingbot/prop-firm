'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '@/lib/api';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { BlogPost } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminBlogPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({ title: '', excerpt: '', body: '', isPublished: false });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'blog'],
    queryFn: () => blogApi.list({ limit: '50' }).then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (fd: FormData) => editPost ? blogApi.update(editPost.id, fd) : blogApi.create(fd),
    onSuccess: () => {
      toast.success(editPost ? 'Post updated!' : 'Post created!');
      setShowModal(false);
      setEditPost(null);
      setForm({ title: '', excerpt: '', body: '', isPublished: false });
      setImageFile(null);
      qc.invalidateQueries({ queryKey: ['admin', 'blog'] });
    },
    onError: () => toast.error('Failed to save post'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.delete(id),
    onSuccess: () => { toast.success('Post deleted'); qc.invalidateQueries({ queryKey: ['admin', 'blog'] }); },
  });

  const openEdit = (post: BlogPost) => {
    setEditPost(post);
    setForm({ title: post.title, excerpt: post.excerpt || '', body: post.body, isPublished: post.isPublished });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('excerpt', form.excerpt);
    fd.append('body', form.body);
    fd.append('isPublished', String(form.isPublished));
    if (imageFile) fd.append('featuredImage', imageFile);
    saveMutation.mutate(fd);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <button onClick={() => { setEditPost(null); setForm({ title: '', excerpt: '', body: '', isPublished: false }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl text-sm hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold">Post</th>
              <th className="text-left px-4 py-3 text-sm font-semibold hidden md:table-cell">Author</th>
              <th className="text-left px-4 py-3 text-sm font-semibold hidden lg:table-cell">Views</th>
              <th className="text-left px-4 py-3 text-sm font-semibold hidden lg:table-cell">Date</th>
              <th className="text-left px-4 py-3 text-sm font-semibold">Status</th>
              <th className="text-right px-4 py-3 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? [...Array(3)].map((_, i) => (
              <tr key={i} className="border-b border-border">
                <td colSpan={6} className="px-4 py-3"><div className="h-8 bg-muted rounded animate-pulse" /></td>
              </tr>
            )) : data?.posts?.map((post: BlogPost) => (
              <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-medium text-sm line-clamp-1">{post.title}</p>
                  <p className="text-xs text-muted-foreground">{post.slug}</p>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                  {(post as any).author?.username}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{post.viewCount}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                  {post.publishedAt ? formatDate(post.publishedAt) : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.isPublished ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                    {post.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {post.isPublished && (
                      <Link href={`/blog/${post.slug}`} target="_blank" className="p-1.5 hover:bg-accent rounded-lg">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    )}
                    <button onClick={() => openEdit(post)} className="p-1.5 hover:bg-accent rounded-lg">
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => { if (confirm('Delete post?')) deleteMutation.mutate(post.id); }} className="p-1.5 hover:bg-destructive/10 rounded-lg">
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
              <h2 className="font-bold">{editPost ? 'Edit Post' : 'New Blog Post'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Title *</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Excerpt</label>
                <textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Content (Markdown) *</label>
                <textarea required value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={12}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Featured Image</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:text-sm" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} className="accent-primary" />
                <span className="text-sm font-medium">Publish immediately</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saveMutation.isPending}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 text-sm">
                  {saveMutation.isPending ? 'Saving...' : editPost ? 'Save Changes' : 'Create Post'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-accent">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
