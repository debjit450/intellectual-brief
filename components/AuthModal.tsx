// src/components/AuthModal.tsx
import React, { useEffect, useState } from 'react';
import { Icons } from '../constants';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import logo from '/assets/logo.png';

interface AuthModalProps {
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn) onClose();
  }, [isSignedIn, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Define the common Clerk appearance configuration
  const clerkAppearance = {
    elements: {
      // 1. ELIMINATE ALL BORDERS/SHADOWS on the main container elements (The Fix)
      rootBox: "w-full h-full",
      card: "shadow-none bg-transparent border-none p-0 w-full h-full border-0",

      // 2. Hide default Clerk branding headers
      headerTitle: "hidden",
      headerSubtitle: "hidden",

      // 3. Style the Social Buttons (Google, etc.)
      socialButtonsBlock: "mb-6 flex gap-2",
      socialButtonsIconButton: "border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 py-3",
      socialButtonsProviderIcon: "dark:invert",

      // 4. Style the Divider (The "OR" line)
      dividerLine: "bg-neutral-200 dark:bg-neutral-800",
      dividerText: "text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase tracking-widest",

      // 5. INPUT FIELDS (Crucial for mobile 16px font fix)
      formFieldLabel: "uppercase text-[10px] tracking-widest text-neutral-500 mb-1",
      formFieldInput: "w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-3 text-base outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all placeholder:text-neutral-400",

      // 6. PRIMARY BUTTON 
      formButtonPrimary: "mt-4 w-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold uppercase tracking-[0.2em] text-[10px] py-4 rounded-md hover:opacity-90 transition-opacity shadow-none",

      // 7. Hide the Footer
      footer: "hidden",
      footerAction: "hidden"
    },
    layout: {
      socialButtonsPlacement: 'top',
      logoPlacement: 'none'
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full sm:max-w-md md:max-w-4xl bg-white dark:bg-neutral-950 flex flex-col md:flex-row overflow-hidden rounded-t-2xl sm:rounded-3xl shadow-2xl max-h-[95vh]">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <Icons.X className="w-5 h-5" />
        </button>

        {/* ----------------------------------------------------------
            SECTION 1: DESKTOP BRANDING SIDEBAR (Hidden on Mobile)
            ---------------------------------------------------------- */}
        <div className="hidden md:flex md:w-5/12 shrink-0 bg-neutral-50 dark:bg-neutral-900/50 border-r border-neutral-200 dark:border-neutral-800 p-8 flex-col justify-between relative">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
              <span className="text-xs font-mono tracking-[0.2em] uppercase text-neutral-500">
                The Intellectual Brief
              </span>
            </div>
            <h2 className="text-3xl font-serif font-semibold text-neutral-900 dark:text-neutral-50 mb-3">
              {mode === 'login' ? 'Welcome Back' : 'Join the Inner Circle'}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 font-serif italic">
              Unlock premium intelligence, curated from the sharpest minds in tech and business.
            </p>

            {/* Value Props */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neutral-400 shrink-0" />
                <p className="text-xs text-neutral-500">Curated daily intelligence.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neutral-400 shrink-0" />
                <p className="text-xs text-neutral-500">Save stories for later.</p>
              </div>
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
            Knowledge is currency.
          </p>
        </div>

        {/* ----------------------------------------------------------
            SECTION 2: AUTH FORM AREA
            ---------------------------------------------------------- */}
        <div className="w-full md:w-7/12 flex flex-col overflow-y-auto">

          {/* MOBILE ONLY HEADER (Replaces the Sidebar) */}
          <div className="md:hidden pt-8 px-6 pb-2 text-center">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain mx-auto mb-3" />
            <h2 className="text-2xl font-serif font-semibold text-neutral-900 dark:text-neutral-50">
              {mode === 'login' ? 'Welcome Back' : 'Get Access'}
            </h2>
            <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">
              The Intellectual Brief
            </p>
          </div>

          <div className="flex-1 px-6 py-6 md:p-10 flex flex-col justify-center">
            <div className="w-full max-w-sm mx-auto">
              {mode === 'login' ? (
                <SignIn
                  routing="hash"
                />
              ) : (
                <SignUp
                  routing="hash"
                />
              )}
            </div>

            {/* Mode Toggle */}
            <div className="mt-6 text-center">
              <p className="text-xs text-neutral-500">
                {mode === 'login' ? "New here?" : 'Already a member?'}
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="ml-2 text-neutral-900 dark:text-neutral-100 font-bold uppercase tracking-wider text-[10px] hover:underline"
                >
                  {mode === 'login' ? 'Apply Now' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;