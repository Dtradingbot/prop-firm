'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '@/lib/api';
import { Check, X, Trash2, Star } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminReviewsPage() {
  const qc = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin', 'reviews', 'pending'],
    queryFn: () => reviewApi.pending().then(r => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => reviewApi.updateStatus(id, status),
    onSuccess: () => { toast.success('Review updated'); qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }); },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewApi.delete(id),
    onSuccess: () => { toast.success('Review deleted'); qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }); },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pending Reviews ({reviews.length})</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Check className="h-12 w-12 mx-auto mb-3 text-green-500" />
          <p>All reviews have been moderated!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link href={`/firms/${review.firm?.slug}`} className="font-semibold text-primary hover:underline">
                      {review.firm?.name}
                    </Link>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{review.user?.username} ({review.user?.email})</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`h-4 w-4 ${i <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                  {review.title && <p className="font-semibold mb-1">{review.title}</p>}
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => statusMutation.mutate({ id: review.id, status: 'APPROVED' })}
                    disabled={statusMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    <Check className="h-4 w-4" /> Approve
                  </button>
                  <button
                    onClick={() => statusMutation.mutate({ id: review.id, status: 'REJECTED' })}
                    disabled={statusMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(review.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
