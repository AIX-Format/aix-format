export type KYATier = 0 | 1 | 2 | 3 | 4;

export interface MarketplaceItem {
  id: string;
  type: 'agent' | 'skill' | 'mcp' | 'plugin' | 'api';
  name: string;
  description: string;
  author: {
    name: string;
    avatar?: string;
  };
  kyaTier: KYATier;
  trustScore: number;
  rating: number;
  reviewCount: number;
  price: {
    type: 'free' | 'pay-per-call' | 'subscription';
    amount?: number;
    currency?: string;
    unit?: string;
  };
  stats: {
    downloads: number;
    usage: number;
    users: number;
  };
  tags: string[];
  image?: string;
  verified: boolean;
  slsaLevel?: 1 | 2 | 3;
}

export const getMarketplaceItems = async (filters?: any): Promise<MarketplaceItem[]> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('q', filters.search);
  if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
  
  try {
    const response = await fetch(`/api/marketplace?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch marketplace');
    return await response.json();
  } catch (error) {
    console.error('Marketplace API Error:', error);
    return [];
  }
};
