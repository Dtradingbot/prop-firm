'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '@/lib/api';
import { Star, ThumbsUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface ReviewSectionProps {
  firmId: string;
  firmName: string;
}

export function ReviewSection({ firmId, firmName }: ReviewSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState({ title: '', body: '' });
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['reviews', firmId],
    queryFn: () => reviewApi.listByFirm(firmId).then(r => r.data),
  });

  const submitMutation = useMutation({
    mutationFn: (formData: FormData) => reviewApi.create(formData),
    onSuccess: () => {
      toast.success('Review submitted! It will appear after approval.');
      setShowForm(false);
      setForm({ title: '', body: '' });
      setRating(5);
      qc.invalidateQueries({ queryKey: ['reviews', firmId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to submit review'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('firmId', firmId);
    fd.append('rating', String(rating));
    fd.append('title', form.title);
    fd.append('body', form.body);
    submitMutation.mutate(fd);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Reviews ({data?.total || 0})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl text-sm hover:bg-primary/90 transition-colors"
        >
          Write a Review
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-muted/30 rounded-xl space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Your Rating</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star className={cn('h-6 w-6 transition-colors', i <= (hoverRating || rating)
                    ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
                  )} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Summarize your experience"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Review *</label>
            <textarea
              required
              value={form.body}
              onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
              placeholder="Share your experience with this prop firm..."
              rows={4}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="px-5 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-border rounded-lg text-sm hover:bg-accent">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-5">
        {data?.reviews?.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">No reviews yet. Be the first to review {firmName}!</p>
        )}
        {data?.reviews?.map((review: any) => (
          <div key={review.id} className="border-b border-border pb-5 last:border-0 last:pb-0">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {review.user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{review.user?.username}</span>
                  {review.isVerified && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Verified</span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">{formatDate(review.createdAt)}</span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={cn('h-3.5 w-3.5', i <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground')} />
                  ))}
                </div>
                {review.title && <p className="font-semibold text-sm mb-1">{review.title}</p>}
                <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>
                {review.proofImage && (
                  <Image src={review.proofImage} alt="Proof" width={200} height={150} className="mt-2 rounded-lg object-cover" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
