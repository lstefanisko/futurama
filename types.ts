
export enum Category {
  SINGULARITY = 'SINGULARITY',
  META_SOCIETY = 'META_SOCIETY',
  ECO_CORE = 'ECO_CORE',
  BIO_GENETICS = 'BIO_GENETICS',
  GALACTIC_AXIS = 'GALACTIC_AXIS'
}

export type Language = 'en' | 'de' | 'es' | 'pl' | 'sk' | 'fr' | 'it';
export type Currency = 'USD' | 'EUR' | 'GBP';

export interface RegionalImpact {
  region: string;
  value: number;
  description: string;
}

export interface PredictionSource {
  uri: string;
  title: string;
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

export interface UserProfile {
  id: string;
  email: string;
  is_pro: boolean;
  is_standard: boolean;
  predictions_count: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}
