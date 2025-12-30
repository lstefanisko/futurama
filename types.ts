
export enum Category {
  TECHNOLOGY = 'TECHNOLOGY',
  SOCIETY = 'SOCIETY',
  ENVIRONMENT = 'ENVIRONMENT',
  HEALTH = 'HEALTH',
  SPACE = 'SPACE'
}

export type Language = 'en' | 'sk' | 'de' | 'pl' | 'es' | 'fr' | 'it' | 'ja' | 'pt' | 'zh';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY';

export interface RegionalImpact {
  region: string;
  value: number;
  description: string;
}

export interface PredictionSource {
  uri: string;
  title: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface Prediction {
  id: string;
  title: string;
  summary: string;
  analysis: string;
  points: string[];
  probability: number;
  impactLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  regionalImpact: RegionalImpact[];
  year: number;
  category: Category;
  imageUrl?: string;
  sources?: PredictionSource[];
  timestamp: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: Record<Currency, string>;
  period: string;
  features: string[];
  isPopular?: boolean;
}
