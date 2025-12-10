import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { Settings, User, CreditCard, Bookmark, LogOut, ArrowLeft, Crown, Zap, Building2 } from 'lucide-react';
import logo from '/assets/logo.png';

const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { plan, isPremium } = useSubscription();
  const navigate = useNavigate();
  const canonicalDomain = 'https://theintellectualbrief.online';
  const accountUrl = `${canonicalDomain}/account`;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getPlanIcon = () => {
    switch (plan) {
      case 'premium':
        return <Crown className="w-5 h-5" />;
      case 'enterprise':
        return <Building2 className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const getPlanName = () => {
    switch (plan) {
      case 'premium':
        return 'Premium';
      case 'enterprise':
        return 'Enterprise';
      default:
        return 'Free';
    }
  };

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Account • The Intellectual Brief</title>
        </Helmet>
        <div className="min-h-screen bg-paper dark:bg-paper-dark flex items-center justify-center">
          <div className="max-w-md w-full mx-auto px-4 text-center">
            <div className="mb-8">
              <img src={logo} alt="Logo" className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h1 className="text-3xl font-serif font-medium text-ink dark:text-ink-dark mb-4">
              Sign In Required
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 font-serif mb-8">
              Please sign in to access your account.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-primary dark:hover:bg-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Account • The Intellectual Brief</title>
        <meta
          name="description"
          content="Manage your account, subscription, and preferences on The Intellectual Brief."
        />
        <link rel="canonical" href={accountUrl} />
      </Helmet>

      <div className="min-h-screen bg-paper dark:bg-paper-dark">
        {/* Header */}
        <header className="border-b border-neutral-200 dark:border-neutral-800 bg-paper dark:bg-paper-dark sticky top-0 z-40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-10 h-10 text-neutral-900 dark:text-white group-hover:text-primary transition-colors">
                  <img src={logo} alt="The Intellectual Brief Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-xl font-serif font-bold text-neutral-900 dark:text-white">
                  The Intellectual Brief
                </span>
              </Link>
              <Link
                to="/"
                className="text-sm font-serif text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-ink dark:text-ink-dark mb-8">
              Account
            </h1>

            {/* Profile Section */}
            <section className="bg-paper dark:bg-paper-dark border border-neutral-200 dark:border-neutral-800 p-8 mb-8">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-2xl font-serif font-bold text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-serif font-medium text-ink dark:text-ink-dark mb-2">
                    {user.name || 'User'}
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 font-serif">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Subscription Status */}
              <div className="flex items-center gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                <div className={`flex items-center gap-2 px-4 py-2 rounded ${
                  isPremium ? 'bg-primary/10 text-primary' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}>
                  {getPlanIcon()}
                  <span className="text-sm font-serif font-medium">
                    {getPlanName()} Plan
                  </span>
                </div>
                {!isPremium && (
                  <Link
                    to="/pricing"
                    className="ml-auto px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary dark:hover:bg-primary transition-colors"
                  >
                    Upgrade
                  </Link>
                )}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="mb-8">
              <h2 className="text-xl font-serif font-medium text-ink dark:text-ink-dark mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/settings"
                  className="flex items-center gap-4 p-6 bg-paper dark:bg-paper-dark border border-neutral-200 dark:border-neutral-800 hover:border-primary transition-colors group"
                >
                  <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Settings className="w-6 h-6 text-neutral-600 dark:text-neutral-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-serif font-medium text-ink dark:text-ink-dark mb-1">
                      Settings
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-serif">
                      Manage your preferences and account settings
                    </p>
                  </div>
                </Link>

                <Link
                  to="/pricing"
                  className="flex items-center gap-4 p-6 bg-paper dark:bg-paper-dark border border-neutral-200 dark:border-neutral-800 hover:border-primary transition-colors group"
                >
                  <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <CreditCard className="w-6 h-6 text-neutral-600 dark:text-neutral-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-serif font-medium text-ink dark:text-ink-dark mb-1">
                      Subscription
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-serif">
                      View and manage your subscription plan
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-4 p-6 bg-paper dark:bg-paper-dark border border-neutral-200 dark:border-neutral-800">
                  <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Bookmark className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-serif font-medium text-ink dark:text-ink-dark mb-1">
                      Bookmarks
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-serif">
                      Coming soon
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-paper dark:bg-paper-dark border border-neutral-200 dark:border-neutral-800">
                  <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <User className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-serif font-medium text-ink dark:text-ink-dark mb-1">
                      Profile
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-serif">
                      Coming soon
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Account Actions */}
            <section className="border-t border-neutral-200 dark:border-neutral-800 pt-8">
              <h2 className="text-xl font-serif font-medium text-ink dark:text-ink-dark mb-4">
                Account Actions
              </h2>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-6 py-3 text-neutral-600 dark:text-neutral-400 hover:text-primary font-serif transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default AccountPage;

