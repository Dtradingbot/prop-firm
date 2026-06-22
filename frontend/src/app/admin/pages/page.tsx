'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pagesApi } from '@/lib/api';
import { Plus, Edit, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PageForm {
  title: string; slug: string; body: string;
  metaTitle: string; metaDescription: string; isPublished: boolean;
}
const empty: PageForm = { title: '', slug: '', body: '', metaTitle: '', metaDescription: '', isPublished: true };

export default function AdminPagesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PageForm>(empty);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['admin', 'pages'],
    queryFn: () => pagesApi.list().then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: PageForm) => editId ? pagesApi.update(editId, data) : pagesApi.create(data),
    onSuccess: () => {
      toast.success(editId ? 'Page updated!' : 'Page created!');
      setShowModal(false); setEditId(null); setForm(empty);
      qc.invalidateQueries({ queryKey: ['admin', 'pages'] });
    },
    onError: () => toast.error('Failed to save'),
  });

  const openEdit = (page: any) => {
    setEditId(page.id);
    setForm({ title: page.title, slug: page.slug, body: page.body, metaTitle: page.metaTitle || '', metaDescription: page.metaDescription || '', isPublished: page.isPublished });
    setShowModal(true);
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (!editId && form.title) {
      setForm(p => ({ ...p, slug: form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }));
    }
  }, [form.title, editId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">CMS Pages</h1>
        <button onClick={() => { setEditId(null); setForm(empty); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl text-sm hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Page
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold">Title</th>
              <th className="text-left px-4 py-3 text-sm font-semibold hidden md:table-cell">Slug</th>
              <th className="text-left px-4 py-3 text-sm font-semibold">Status</th>
              <th className="text-right px-4 py-3 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? [...Array(3)].map((_, i) => (
              <tr key={i} className="border-b border-border">
                <td colSpan={4} className="px-4 py-3"><div className="h-8 bg-muted rounded animate-pulse" /></td>
              </tr>
            )) : pages.map((page: any) => (
              <tr key={page.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-sm">{page.title}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <code className="text-xs bg-muted px-2 py-0.5 rounded">/pages/{page.slug}</code>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${page.isPublished ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                    {page.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <a href={`/pages/${page.slug}`} target="_blank" className="p-1.5 hover:bg-accent rounded-lg">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </a>
                    <button onClick={() => openEdit(page)} className="p-1.5 hover:bg-accent rounded-lg">
                      <Edit className="h-4 w-4 text-muted-foreground" />
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
              <h2 className="font-bold">{editId ? 'Edit Page' : 'New Page'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(form); }} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Page Title *</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/pages/</span>
                  <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Content *</label>
                <textarea required value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={10}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Meta Title</label>
                <input value={form.metaTitle} onChange={e => setForm(p => ({ ...p, metaTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Meta Description</label>
                <textarea value={form.metaDescription} onChange={e => setForm(p => ({ ...p, metaDescription: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} className="accent-primary" />
                <span className="text-sm font-medium">Published</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saveMutation.isPending}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 text-sm">
                  {saveMutation.isPending ? 'Saving...' : editId ? 'Save Changes' : 'Create Page'}
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
