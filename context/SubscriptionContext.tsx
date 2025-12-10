import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type SubscriptionPlan = 'free' | 'premium' | 'enterprise';

interface SubscriptionContextValue {
  plan: SubscriptionPlan;
  isPremium: boolean;
  isLoading: boolean;
  upgradeToPremium: () => void;
  checkPremiumAccess: () => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<SubscriptionPlan>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check user's subscription plan from localStorage or API
    // For now, we'll use localStorage. Later, this can be connected to a backend
    if (typeof window !== 'undefined') {
      const storedPlan = localStorage.getItem('user_subscription_plan') as SubscriptionPlan | null;
      if (storedPlan && ['free', 'premium', 'enterprise'].includes(storedPlan)) {
        setPlan(storedPlan);
      } else {
        setPlan('free');
      }
    }
    setIsLoading(false);
  }, [user]);

  const upgradeToPremium = () => {
    // This will be connected to payment gateway later
    // For now, we'll just show a message
    if (typeof window !== 'undefined') {
      // In production, this would redirect to payment gateway
      // For now, we'll store it locally for demo purposes
      localStorage.setItem('user_subscription_plan', 'premium');
      setPlan('premium');
    }
  };

  const checkPremiumAccess = (): boolean => {
    return plan === 'premium' || plan === 'enterprise';
  };

  const value: SubscriptionContextValue = {
    plan,
    isPremium: checkPremiumAccess(),
    isLoading,
    upgradeToPremium,
    checkPremiumAccess,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
};

