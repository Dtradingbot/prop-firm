import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function getTrustScoreClass(score: number): string {
  if (score >= 80) return 'trust-score-high';
  if (score >= 60) return 'trust-score-medium';
  return 'trust-score-low';
}

export function getTrustLabel(score: number): string {
  if (score >= 80) return 'High Trust';
  if (score >= 60) return 'Medium Trust';
  return 'Low Trust';
}

export function getAffiliateUrl(firmSlug: string, source = 'directory'): string {
  return `/go/${firmSlug}?source=${source}`;
}

export function generateStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}
