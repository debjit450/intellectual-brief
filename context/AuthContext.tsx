// context/AuthContext.tsx
import React, { createContext, useContext } from 'react';
import {
  useUser,
  useClerk,
  SignInButton,
  SignUpButton,
} from '@clerk/clerk-react';

interface AuthContextValue {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  // Clerks handles login/signup UI; these can be stubs or helpers if you want.
  openLogin?: () => void;
  openSignup?: () => void;
  logout: () => Promise<void>;
  SignInButtonComponent: typeof SignInButton;
  SignUpButtonComponent: typeof SignUpButton;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isSignedIn } = useUser();
  const { signOut, openSignIn, openSignUp } = useClerk();

  const value: AuthContextValue = {
    user: isSignedIn && user
      ? {
        id: user.id,
        name: user.fullName,
        email: user.primaryEmailAddress?.emailAddress ?? null,
      }
      : null,
    openLogin: () => openSignIn(),
    openSignup: () => openSignUp(),
    logout: async () => {
      await signOut();
    },
    SignInButtonComponent: SignInButton,
    SignUpButtonComponent: SignUpButton,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
