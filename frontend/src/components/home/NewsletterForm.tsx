'use client';
import { useState } from 'react';
import { newsletterApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await newsletterApi.subscribe(email);
      toast.success('Successfully subscribed!');
      setEmail('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-2', compact ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row max-w-md mx-auto')}>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="flex-1 px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm shrink-0"
      >
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  );
}
