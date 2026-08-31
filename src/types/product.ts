export type ProductCategory = 
  | 'ai-subscription'
  | 'course'
  | 'credits'
  | 'bundle';

export type ProductTier = 'shared' | 'private' | 'lifetime' | 'monthly' | 'annual';

export interface ProductFeature {
  id: string;
  title: string;
  titleAr: string;
  included: boolean;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  shortDescription: string;
  shortDescriptionAr: string;
  fullDescription: string;
  fullDescriptionAr: string;
  category: ProductCategory;
  tier: ProductTier;
  priceUSD: number;
  originalPriceUSD?: number;
  badgeText?: string;
  badgeTextAr?: string;
  isPopular?: boolean;
  isAvailable: boolean;
  instantDelivery: boolean;
  thumbnailUrl: string;
  features: ProductFeature[];
  stockCount?: number;
  metadata?: {
    platform?: 'OpenAI' | 'Anthropic' | 'Midjourney' | 'Canva' | 'Self-Hosted';
    duration?: string;
    durationAr?: string;
    level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
    accessType?: 'Shared Account' | 'Private Key' | 'Invite' | 'Direct LMS';
  };
}

export interface CategoryFilterOption {
  id: ProductCategory | 'all';
  label: string;
  labelAr: string;
  iconName?: string;
}
