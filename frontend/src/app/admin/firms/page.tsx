'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firmApi } from '@/lib/api';
import { Plus, Edit, Trash2, ExternalLink, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { FirmFormModal } from '@/components/admin/FirmFormModal';
import { PropFirm } from '@/types';

export default function AdminFirmsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editFirm, setEditFirm] = useState<PropFirm | null>(null);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'firms', search],
    queryFn: () => firmApi.list({ search, limit: '50' }).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => firmApi.delete(id),
    onSuccess: () => { toast.success('Firm deleted'); qc.invalidateQueries({ queryKey: ['admin', 'firms'] }); },
    onError: () => toast.error('Failed to delete'),
  });

  const handleDelete = (firm: PropFirm) => {
    if (confirm(`Delete "${firm.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(firm.id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Prop Firms</h1>
        <button
          onClick={() => { setEditFirm(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Firm
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search firms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 pr-4 py-2 border border-input rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full max-w-sm"
        />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold">Firm</th>
              <th className="text-left px-4 py-3 text-sm font-semibold hidden md:table-cell">Funding</th>
              <th className="text-left px-4 py-3 text-sm font-semibold hidden lg:table-cell">Rating</th>
              <th className="text-left px-4 py-3 text-sm font-semibold hidden lg:table-cell">Clicks</th>
              <th className="text-left px-4 py-3 text-sm font-semibold">Status</th>
              <th className="text-right px-4 py-3 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={6} className="px-4 py-3"><div className="h-8 bg-muted rounded animate-pulse" /></td>
                </tr>
              ))
            ) : data?.firms?.map((firm: PropFirm) => (
              <tr key={firm.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted overflow-hidden shrink-0">
                      {firm.logo
                        ? <Image src={firm.logo} alt={firm.name} width={36} height={36} className="object-contain" />
                        : <span className="flex items-center justify-center h-full text-sm font-bold text-muted-foreground">{firm.name[0]}</span>
                      }
                    </div>
                    <div>
                      <p className="font-medium text-sm">{firm.name}</p>
                      <p className="text-xs text-muted-foreground">{firm.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm hidden md:table-cell">
                  {firm.maxFundingSize ? `$${(firm.maxFundingSize/1000).toFixed(0)}K` : '—'}
                </td>
                <td className="px-4 py-3 text-sm hidden lg:table-cell">
                  ★ {firm.averageRating.toFixed(1)} ({firm.reviewCount})
                </td>
                <td className="px-4 py-3 text-sm hidden lg:table-cell">{firm.clickCount}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${firm.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                    {firm.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {firm.isFeatured && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 ml-1">
                      Featured
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/firms/${firm.slug}`} target="_blank" className="p-1.5 hover:bg-accent rounded-lg transition-colors">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </Link>
                    <button onClick={() => { setEditFirm(firm); setShowModal(true); }} className="p-1.5 hover:bg-accent rounded-lg transition-colors">
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleDelete(firm)} className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors">
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
        <FirmFormModal
          firm={editFirm}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); qc.invalidateQueries({ queryKey: ['admin', 'firms'] }); }}
        />
      )}
    </div>
  );
}
