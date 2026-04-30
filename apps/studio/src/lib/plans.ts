/**
 * AIX Studio Subscription Plans
 */

export type PlanType = 'free' | 'builder' | 'pro' | 'enterprise';

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  stripePriceId?: string;
  limits: {
    agents: number; // -1 for unlimited
    exports: string[];
    abom_scans: number; // -1 for unlimited
    api_access: boolean;
  };
  features: string[];
}

export const PLANS: Record<PlanType, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    limits: {
      agents: 3,
      exports: ['yaml'],
      abom_scans: 5,
      api_access: false
    },
    features: [
      'Up to 3 AI Agents',
      'AIX YAML Export',
      'Basic Risk Scanning (5/mo)',
      'Community Support'
    ]
  },
  builder: {
    id: 'builder',
    name: 'Builder',
    price: 19,
    stripePriceId: 'price_builder_standard',
    limits: {
      agents: -1,
      exports: ['yaml', 'json', 'mcp'],
      abom_scans: 50,
      api_access: false
    },
    features: [
      'Unlimited AI Agents',
      'YAML, JSON & MCP Export',
      'Advanced ABOM Scans (50/mo)',
      'Email Support'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Studio Pro',
    price: 49,
    stripePriceId: 'price_pro_standard',
    limits: {
      agents: -1,
      exports: ['yaml', 'json', 'mcp', 'pdf'],
      abom_scans: -1,
      api_access: true
    },
    features: [
      'Everything in Builder',
      'PDF Risk Reports',
      'Unlimited ABOM Scans',
      'REST API Access',
      'Priority Support'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    stripePriceId: 'price_enterprise_custom',
    limits: {
      agents: -1,
      exports: ['yaml', 'json', 'mcp', 'pdf', 'custom'],
      abom_scans: -1,
      api_access: true
    },
    features: [
      'Everything in Pro',
      'Custom Compliance Rules',
      'SSO Integration',
      'White-label Reports',
      'Dedicated Account Manager'
    ]
  }
};
