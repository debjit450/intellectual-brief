import React from 'react';
import { 
  Globe, 
  Search, 
  Bookmark, 
  User, 
  Menu, 
  X, 
  Share2, 
  ExternalLink,
  ChevronRight,
  Loader2,
  Sun,
  Moon,
  Clock,
  ArrowUpRight,
  Briefcase,
  Cpu,
  TrendingUp,
  Landmark,
  Scale,
  Zap
} from 'lucide-react';
import { Category } from './types';

export const CATEGORIES: Category[] = ['Technology', 'Business', 'Artificial Intelligence', 'Venture Capital', 'Markets', 'Policy'];

// Luxury Monogram "IB"
export const TBLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M35 20 H45 V80 H35 V20 Z M55 20 H75 C85 20 90 25 90 35 C90 42 85 48 75 48 H55 V20 Z M55 52 H75 C85 52 90 58 90 68 C90 75 85 80 75 80 H55 V52 Z M65 28 V40 H72 C78 40 80 38 80 34 C80 30 78 28 72 28 H65 Z M65 60 V72 H72 C78 72 80 70 80 66 C80 62 78 60 72 60 H65 Z" />
  </svg>
);

export const ICONS: Record<string, React.ReactNode> = {
  'Technology': <Cpu className="w-4 h-4" />,
  'Business': <Briefcase className="w-4 h-4" />,
  'Artificial Intelligence': <Zap className="w-4 h-4" />,
  'Venture Capital': <TrendingUp className="w-4 h-4" />,
  'Markets': <Landmark className="w-4 h-4" />,
  'Policy': <Scale className="w-4 h-4" />,
};

export const Icons = {
  Logo: Globe,
  Search,
  Bookmark,
  User,
  Menu,
  X,
  Share: Share2,
  ExternalLink,
  ChevronRight,
  Loader: Loader2,
  Sun,
  Moon,
  Clock,
  ArrowUpRight
};

export const AD_CONFIG = {
  client: 'ca-pub-4286398875959777',
  slots: {
    sidebar: '1234567890',
    feed: '0987654321',
  }
};