export interface Broker {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  regulation?: string;
  rating: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  _count?: { firms: number };
}

export interface FundingProgram {
  id: string;
  firmId: string;
  name: string;
  accountSizes: number[];
  profitSplit: number;
  fee?: number;
  description?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface Offer {
  id: string;
  title: string;
  description?: string;
  discount?: number;
  couponCode?: string;
  affiliateUrl: string;
  expiresAt?: string;
  isActive: boolean;
  firmId: string;
  firm?: { id: string; name: string; slug: string; logo?: string };
  createdAt: string;
}

export interface Review {
  id: string;
  firmId: string;
  userId: string;
  rating: number;
  title?: string;
  body: string;
  proofImage?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isVerified: boolean;
  helpfulVotes: number;
  createdAt: string;
  user?: { id: string; username: string; avatar?: string };
  firm?: { id: string; name: string; slug: string };
}

export type EvaluationType = 'ONE_STEP' | 'TWO_STEP' | 'THREE_STEP' | 'INSTANT';

export interface PropFirm {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  shortDescription?: string;
  websiteUrl?: string;
  affiliateUrl?: string;
  country?: string;
  founded?: number;
  headquarters?: string;
  platforms: string[];
  evaluationType: EvaluationType;
  instantFunding: boolean;
  minFundingSize?: number;
  maxFundingSize?: number;
  profitSplit?: number;
  maxAllocation?: number;
  tradingFee?: number;
  payoutFrequency?: string;
  maxDailyDrawdown?: number;
  maxTotalDrawdown?: number;
  drawdownType?: string;
  rules?: Record<string, unknown>;
  brokerId?: string;
  broker?: Broker;
  trustScore: number;
  averageRating: number;
  reviewCount: number;
  viewCount: number;
  clickCount: number;
  engagementScore: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Meta
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogImage?: string;
  // Relations
  reviews?: Review[];
  offers?: Offer[];
  faqs?: FAQ[];
  fundingPrograms?: FundingProgram[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body: string;
  featuredImage?: string;
  authorId: string;
  author?: { id: string; username: string; avatar?: string };
  categoryId?: string;
  category?: { id: string; name: string; slug: string };
  tags?: { id: string; name: string; slug: string }[];
  isPublished: boolean;
  publishedAt?: string;
  viewCount: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'EDITOR' | 'SUPER_ADMIN';
  avatar?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export interface FirmListResponse {
  firms: PropFirm[];
  total: number;
  page: number;
  pages: number;
}
