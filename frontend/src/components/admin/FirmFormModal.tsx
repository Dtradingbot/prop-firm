'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { firmApi } from '@/lib/api';
import { PropFirm } from '@/types';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  firm?: PropFirm | null;
  onClose: () => void;
  onSuccess: () => void;
}

const evalTypes = ['ONE_STEP', 'TWO_STEP', 'THREE_STEP', 'INSTANT'];
const platforms = ['MT4', 'MT5', 'cTrader', 'TradingView', 'NinjaTrader', 'Rithmic'];

export function FirmFormModal({ firm, onClose, onSuccess }: Props) {
  const isEdit = !!firm;
  const [form, setForm] = useState({
    name: firm?.name || '',
    shortDescription: firm?.shortDescription || '',
    description: firm?.description || '',
    websiteUrl: firm?.websiteUrl || '',
    affiliateUrl: firm?.affiliateUrl || '',
    country: firm?.country || '',
    evaluationType: firm?.evaluationType || 'TWO_STEP',
    instantFunding: firm?.instantFunding || false,
    platforms: firm?.platforms || [],
    minFundingSize: firm?.minFundingSize || '',
    maxFundingSize: firm?.maxFundingSize || '',
    profitSplit: firm?.profitSplit || '',
    maxDailyDrawdown: firm?.maxDailyDrawdown || '',
    maxTotalDrawdown: firm?.maxTotalDrawdown || '',
    payoutFrequency: firm?.payoutFrequency || '',
    isFeatured: firm?.isFeatured || false,
    isActive: firm?.isActive ?? true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: (fd: FormData) => isEdit ? firmApi.update(firm!.id, fd) : firmApi.create(fd),
    onSuccess: () => { toast.success(isEdit ? 'Firm updated!' : 'Firm created!'); onSuccess(); },
    onError: () => toast.error('Failed to save firm'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'platforms') fd.append(k, JSON.stringify(v));
      else if (k === 'instantFunding' || k === 'isFeatured' || k === 'isActive') fd.append(k, String(v));
      else if (v !== '' && v !== null && v !== undefined) fd.append(k, String(v));
    });
    if (logoFile) fd.append('logo', logoFile);
    mutation.mutate(fd);
  };

  const togglePlatform = (p: string) => {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p) ? prev.platforms.filter(x => x !== p) : [...prev.platforms, p],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-bold">{isEdit ? `Edit ${firm!.name}` : 'Add New Firm'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-accent rounded-lg"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium block mb-1.5">Firm Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium block mb-1.5">Logo</label>
              <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)}
                className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:text-sm file:font-medium" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium block mb-1.5">Short Description</label>
              <input value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Website URL</label>
              <input value={form.websiteUrl} onChange={e => setForm(p => ({ ...p, websiteUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Affiliate URL</label>
              <input value={form.affiliateUrl} onChange={e => setForm(p => ({ ...p, affiliateUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Min Funding ($)</label>
              <input type="number" value={form.minFundingSize} onChange={e => setForm(p => ({ ...p, minFundingSize: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Max Funding ($)</label>
              <input type="number" value={form.maxFundingSize} onChange={e => setForm(p => ({ ...p, maxFundingSize: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Profit Split (%)</label>
              <input type="number" value={form.profitSplit} onChange={e => setForm(p => ({ ...p, profitSplit: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Daily Drawdown (%)</label>
              <input type="number" value={form.maxDailyDrawdown} onChange={e => setForm(p => ({ ...p, maxDailyDrawdown: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Max Drawdown (%)</label>
              <input type="number" value={form.maxTotalDrawdown} onChange={e => setForm(p => ({ ...p, maxTotalDrawdown: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Evaluation Type</label>
              <select value={form.evaluationType} onChange={e => setForm(p => ({ ...p, evaluationType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {evalTypes.map(t => <option key={t} value={t}>{t.replace('_', '-')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Country</label>
              <input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Platforms</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map(p => (
                <button type="button" key={p} onClick={() => togglePlatform(p)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.platforms.includes(p) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            {[
              { key: 'instantFunding', label: 'Instant Funding' },
              { key: 'isFeatured', label: 'Featured' },
              { key: 'isActive', label: 'Active' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))}
                  className="accent-primary w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={mutation.isPending}
              className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Firm'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 border border-border rounded-xl font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
