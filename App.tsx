import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { Analytics } from "@vercel/analytics/react";
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import RSSPage from './pages/RSSPage';
import SitemapPage from './pages/SitemapPage';
import NewsSitemapPage from './pages/NewsSitemapPage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import EditorialPolicyPage from './pages/EditorialPolicyPage';
import ContactPage from './pages/ContactPage';
import MastheadPage from './pages/MastheadPage';
import DisclaimerPage from './pages/DisclaimerPage';
import AccessibilityPage from './pages/AccessibilityPage';
import PricingPage from './pages/PricingPage';
import AccountPage from './pages/AccountPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <SubscriptionProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/rss.xml" element={<RSSPage />} />
              <Route path="/sitemap.xml" element={<SitemapPage />} />
              <Route path="/news-sitemap.xml" element={<NewsSitemapPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/cookies" element={<CookiePolicyPage />} />
              <Route path="/editorial" element={<EditorialPolicyPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/masthead" element={<MastheadPage />} />
              <Route path="/disclaimer" element={<DisclaimerPage />} />
              <Route path="/accessibility" element={<AccessibilityPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Analytics />
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default App;
