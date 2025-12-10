import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Moon, Sun, Bell, Globe, Eye, EyeOff, Save } from 'lucide-react';
import logo from '/assets/logo.png';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    newsletter: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
  });
  const [saved, setSaved] = useState(false);

  const canonicalDomain = 'https://theintellectualbrief.online';
  const settingsUrl = `${canonicalDomain}/settings`;

  const handleSave = () => {
    // Save settings to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_notifications', JSON.stringify(notifications));
      localStorage.setItem('user_privacy', JSON.stringify(privacy));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Settings • The Intellectual Brief</title>
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
              Please sign in to access settings.
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
        <title>Settings • The Intellectual Brief</title>
        <meta
          name="description"
          content="Manage your settings and preferences on The Intellectual Brief."
        />
        <link rel="canonical" href={settingsUrl} />
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
                to="/account"
                className="text-sm font-serif text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors"
              >
                ← Back to Account
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-ink dark:text-ink-dark mb-8">
              Settings
            </h1>

            {/* Appearance */}
            <section className="bg-paper dark:bg-paper-dark border border-neutral-200 dark:border-neutral-800 p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                {theme === 'dark' ? (
                  <Moon className="w-6 h-6 text-primary" />
                ) : (
                  <Sun className="w-6 h-6 text-primary" />
                )}
                <h2 className="text-2xl font-serif font-medium text-ink dark:text-ink-dark">
                  Appearance
                </h2>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-700 dark:text-neutral-300 font-serif mb-1">
                    Theme
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 font-serif">
                    Choose between light and dark mode
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-serif hover:bg-primary/10 transition-colors"
                >
                  {theme === 'dark' ? (
                    <>
                      <Moon className="w-4 h-4" />
                      Dark
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4" />
                      Light
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Notifications */}
            <section className="bg-paper dark:bg-paper-dark border border-neutral-200 dark:border-neutral-800 p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-serif font-medium text-ink dark:text-ink-dark">
                  Notifications
                </h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-700 dark:text-neutral-300 font-serif mb-1">
                      Email Notifications
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-500 font-serif">
                      Receive updates via email
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.email ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        notifications.email ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-700 dark:text-neutral-300 font-serif mb-1">
                      Push Notifications
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-500 font-serif">
                      Coming soon
                    </p>
                  </div>
                  <button
                    disabled
                    className="w-12 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 opacity-50 cursor-not-allowed"
                  >
                    <div className="w-5 h-5 bg-white rounded-full translate-x-0.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-700 dark:text-neutral-300 font-serif mb-1">
                      Newsletter
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-500 font-serif">
                      Weekly digest of top stories
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, newsletter: !notifications.newsletter })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.newsletter ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        notifications.newsletter ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Privacy */}
            <section className="bg-paper dark:bg-paper-dark border border-neutral-200 dark:border-neutral-800 p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-serif font-medium text-ink dark:text-ink-dark">
                  Privacy
                </h2>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-neutral-700 dark:text-neutral-300 font-serif mb-3">
                    Profile Visibility
                  </p>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white font-serif focus:outline-none focus:border-primary"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-700 dark:text-neutral-300 font-serif mb-1">
                      Show Email Address
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-500 font-serif">
                      Display your email on your profile
                    </p>
                  </div>
                  <button
                    onClick={() => setPrivacy({ ...privacy, showEmail: !privacy.showEmail })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      privacy.showEmail ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        privacy.showEmail ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Language & Region */}
            <section className="bg-paper dark:bg-paper-dark border border-neutral-200 dark:border-neutral-800 p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-serif font-medium text-ink dark:text-ink-dark">
                  Language & Region
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-neutral-700 dark:text-neutral-300 font-serif mb-3">
                    Language
                  </p>
                  <select
                    disabled
                    className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500 font-serif cursor-not-allowed"
                  >
                    <option>English (Coming Soon)</option>
                  </select>
                </div>
                <div>
                  <p className="text-neutral-700 dark:text-neutral-300 font-serif mb-3">
                    Region
                  </p>
                  <select
                    disabled
                    className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500 font-serif cursor-not-allowed"
                  >
                    <option>Global (Coming Soon)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-primary/90 transition-colors"
              >
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default SettingsPage;

