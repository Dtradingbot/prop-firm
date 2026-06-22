'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brokerApi } from '@/lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface BrokerForm {
  name: string; website: string; regulation: string; description: string; rating: string;
}
const empty: BrokerForm = { name: '', website: '', regulation: '', description: '', rating: '4' };

export default function AdminBrokersPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<BrokerForm>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { data: brokers = [], isLoading } = useQuery({
    queryKey: ['brokers'],
    queryFn: () => brokerApi.list().then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (fd: FormData) => editId ? brokerApi.update(editId, fd) : brokerApi.create(fd),
    onSuccess: () => {
      toast.success(editId ? 'Broker updated!' : 'Broker created!');
      setShowModal(false); setForm(empty); setEditId(null); setLogoFile(null);
      qc.invalidateQueries({ queryKey: ['brokers'] });
    },
    onError: () => toast.error('Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => brokerApi.delete(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['brokers'] }); },
  });

  const openEdit = (broker: any) => {
    setForm({ name: broker.name, website: broker.website || '', regulation: broker.regulation || '', description: broker.description || '', rating: String(broker.rating) });
    setEditId(broker.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (logoFile) fd.append('logo', logoFile);
    saveMutation.mutate(fd);
  };

  const field = (key: keyof BrokerForm, label: string, type = 'text') => (
    <div>
      <label className="text-sm font-medium block mb-1">{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Brokers</h1>
        <button onClick={() => { setForm(empty); setEditId(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl text-sm hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Broker
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? [...Array(3)].map((_, i) => <div key={i} className="h-40 bg-muted rounded-2xl animate-pulse" />) :
          brokers.map((broker: any) => (
            <div key={broker.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {broker.logo ? <Image src={broker.logo} alt={broker.name} width={48} height={48} className="object-contain" />
                    : <span className="font-bold text-muted-foreground">{broker.name[0]}</span>}
                </div>
                <div>
                  <p className="font-semibold">{broker.name}</p>
                  <p className="text-xs text-muted-foreground">{broker.regulation || 'No regulation info'}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{broker.description || 'No description'}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  {broker._count?.firms || 0} firms
                </span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(broker)} className="p-1.5 hover:bg-accent rounded-lg"><Edit className="h-4 w-4 text-muted-foreground" /></button>
                  <button onClick={() => { if (confirm('Delete broker?')) deleteMutation.mutate(broker.id); }} className="p-1.5 hover:bg-destructive/10 rounded-lg">
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-bold">{editId ? 'Edit Broker' : 'New Broker'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {field('name', 'Broker Name *')}
              {field('website', 'Website URL')}
              {field('regulation', 'Regulation (e.g. ASIC, CySEC)')}
              {field('rating', 'Rating (1-5)', 'number')}
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Logo</label>
                <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)}
                  className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saveMutation.isPending}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 text-sm">
                  {saveMutation.isPending ? 'Saving...' : editId ? 'Save' : 'Create'}
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
