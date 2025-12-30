
export enum Category {
  TECHNOLOGY = 'TECHNOLOGY',
  SOCIETY = 'SOCIETY',
  ENVIRONMENT = 'ENVIRONMENT',
  HEALTH = 'HEALTH',
  SPACE = 'SPACE'
}

export type Language = 'sk' | 'en' | 'de' | 'pl' | 'es';

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
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
}
