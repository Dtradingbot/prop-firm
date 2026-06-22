'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offerApi, firmApi } from '@/lib/api';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import { Offer } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface OfferFormData {
  title: string;
  description: string;
  discount: string;
  couponCode: string;
  affiliateUrl: string;
  expiresAt: string;
  firmId: string;
  isActive: boolean;
}

const empty: OfferFormData = {
  title: '', description: '', discount: '', couponCode: '',
  affiliateUrl: '', expiresAt: '', firmId: '', isActive: true,
};

export default function AdminOffersPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<OfferFormData>(empty);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['admin', 'offers'],
    queryFn: () => offerApi.list().then(r => r.data),
  });

  const { data: firmsData } = useQuery({
    queryKey: ['firms', 'all'],
    queryFn: () => firmApi.list({ limit: '200' }).then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: object) => editId ? offerApi.update(editId, data) : offerApi.create(data),
    onSuccess: () => {
      toast.success(editId ? 'Offer updated!' : 'Offer created!');
      setShowModal(false);
      setForm(empty);
      setEditId(null);
      qc.invalidateQueries({ queryKey: ['admin', 'offers'] });
    },
    onError: () => toast.error('Failed to save offer'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => offerApi.delete(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin', 'offers'] }); },
  });

  const openEdit = (offer: Offer) => {
    setForm({
      title: offer.title || '',
      description: offer.description || '',
      discount: String(offer.discount || ''),
      couponCode: offer.couponCode || '',
      affiliateUrl: offer.affiliateUrl || '',
      expiresAt: offer.expiresAt ? offer.expiresAt.split('T')[0] : '',
      firmId: offer.firmId || '',
      isActive: offer.isActive,
    });
    setEditId(offer.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      discount: form.discount ? parseFloat(form.discount) : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };
    saveMutation.mutate(payload);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Offers & Coupons</h1>
        <button
          onClick={() => { setForm(empty); setEditId(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl text-sm hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Offer
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold">Offer</th>
              <th className="text-left px-4 py-3 text-sm font-semibold hidden md:table-cell">Firm</th>
              <th className="text-left px-4 py-3 text-sm font-semibold hidden lg:table-cell">Code</th>
              <th className="text-left px-4 py-3 text-sm font-semibold hidden lg:table-cell">Expires</th>
              <th className="text-left px-4 py-3 text-sm font-semibold">Status</th>
              <th className="text-right px-4 py-3 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={6} className="px-4 py-3"><div className="h-8 bg-muted rounded animate-pulse" /></td>
                </tr>
              ))
            ) : offers.map((offer: Offer) => (
              <tr key={offer.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">{offer.title}</p>
                    {offer.discount && <p className="text-xs text-green-600 dark:text-green-400">{offer.discount}% OFF</p>}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                  {(offer as any).firm?.name || '—'}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {offer.couponCode
                    ? <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{offer.couponCode}</code>
                    : <span className="text-muted-foreground text-xs">—</span>
                  }
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                  {offer.expiresAt ? formatDate(offer.expiresAt) : 'No expiry'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${offer.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(offer)} className="p-1.5 hover:bg-accent rounded-lg">
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => { if (confirm('Delete this offer?')) deleteMutation.mutate(offer.id); }}
                      className="p-1.5 hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-bold">{editId ? 'Edit Offer' : 'New Offer'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Firm *</label>
                <select required value={form.firmId} onChange={e => setForm(p => ({ ...p, firmId: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select a firm...</option>
                  {firmsData?.firms?.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Offer Title *</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Discount (%)</label>
                  <input type="number" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Coupon Code</label>
                  <input value={form.couponCode} onChange={e => setForm(p => ({ ...p, couponCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Affiliate URL *</label>
                <input required value={form.affiliateUrl} onChange={e => setForm(p => ({ ...p, affiliateUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Expiry Date</label>
                <input type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="accent-primary" />
                <span className="text-sm font-medium">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saveMutation.isPending}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 text-sm">
                  {saveMutation.isPending ? 'Saving...' : editId ? 'Save Changes' : 'Create Offer'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-accent">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
