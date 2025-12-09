import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { Analytics } from "@vercel/analytics/react";
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:slug" element={<ArticlePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Analytics />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default App;
