import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../constants.tsx';
import logo from '/assets/logo.png';
import { Check, X, Zap, Crown, Building2, ArrowRight } from 'lucide-react';

const PricingPage: React.FC = () => {
  const { plan, isPremium, upgradeToPremium } = useSubscription();
  const { user } = useAuth();
  const canonicalDomain = 'https://theintellectualbrief.online';
  const pricingUrl = `${canonicalDomain}/pricing`;

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for casual readers',
      icon: <Zap className="w-6 h-6" />,
      features: [
        'Access to basic article summaries',
        'Limited AI-generated briefs (when available)',
        'Bookmark articles',
        'Search functionality',
        'Standard reading experience',
      ],
      limitations: [
        'No access when service is exhausted',
        'No premium article content',
        'Limited to free-tier features',
      ],
      cta: user ? 'Current Plan' : 'Get Started',
      popular: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$9.99',
      period: 'per month',
      description: 'For serious readers and professionals',
      icon: <Crown className="w-6 h-6" />,
      features: [
        'Unlimited AI-generated briefs',
        'Access when service is exhausted',
        'Premium article content',
        'Priority support',
        'Ad-free experience',
        'Early access to new features',
        'Advanced search filters',
        'Export articles to PDF',
      ],
      limitations: [],
      cta: isPremium ? 'Current Plan' : 'Upgrade to Premium',
      popular: true,
      highlight: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For teams and organizations',
      icon: <Building2 className="w-6 h-6" />,
      features: [
        'Everything in Premium',
        'Team collaboration features',
        'Custom AI model training',
        'Dedicated account manager',
        'API access',
        'White-label options',
        'Custom integrations',
        'SLA guarantees',
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  const handleUpgrade = (planId: string) => {
    // All plans are coming soon
    alert('Pricing plans are coming soon! Please check back later or contact us for early access.');
  };

  return (
    <>
      <Helmet>
        <title>Pricing Plans • The Intellectual Brief</title>
        <meta
          name="description"
          content="Choose the perfect plan for your needs. Free, Premium, and Enterprise plans available. Get unlimited AI-generated briefs, premium content, and priority access."
        />
        <meta
          name="keywords"
          content="pricing, subscription, premium, enterprise, AI news, business intelligence, executive brief, The Intellectual Brief"
        />
        <meta name="author" content="The Intellectual Brief" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={pricingUrl} />
        <meta httpEquiv="content-language" content="en-US" />
        <meta name="language" content="English" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Pricing Plans • The Intellectual Brief" />
        <meta
          property="og:description"
          content="Choose the perfect plan for your needs. Free, Premium, and Enterprise plans available."
        />
        <meta property="og:url" content={pricingUrl} />
        <meta property="og:site_name" content="The Intellectual Brief" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pricing Plans • The Intellectual Brief" />
        <meta
          name="twitter:description"
          content="Choose the perfect plan for your needs. Free, Premium, and Enterprise plans available."
        />
        <meta name="twitter:site" content="@TIBReports" />
        <meta name="twitter:creator" content="@TIBReports" />

        {/* Structured Data - Service Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'The Intellectual Brief - Premium Subscription',
            description: 'AI-powered news briefs and executive intelligence reports',
            provider: {
              '@type': 'Organization',
              name: 'The Intellectual Brief',
              url: 'https://theintellectualbrief.online',
            },
            areaServed: 'Worldwide',
            serviceType: 'News Subscription Service',
            offers: [
              {
                '@type': 'Offer',
                name: 'Free Plan',
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
              {
                '@type': 'Offer',
                name: 'Premium Plan',
                price: '9.99',
                priceCurrency: 'USD',
                priceSpecification: {
                  '@type': 'UnitPriceSpecification',
                  price: '9.99',
                  priceCurrency: 'USD',
                  billingIncrement: 'P1M',
                },
                availability: 'https://schema.org/InStock',
              },
            ],
          })}
        </script>

        {/* BreadcrumbList Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://theintellectualbrief.online/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Pricing',
                item: pricingUrl,
              },
            ],
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-paper dark:bg-paper-dark">
        {/* Header */}
        <header className="border-b border-neutral-200 dark:border-neutral-800 bg-paper dark:bg-paper-dark sticky top-0 z-40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center gap-2 sm:gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-900 dark:text-white group-hover:text-primary transition-colors">
                  <img src={logo} alt="The Intellectual Brief Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-base sm:text-lg md:text-xl font-serif font-bold text-neutral-900 dark:text-white">
                  The Intellectual Brief
                </span>
              </Link>
              <Link
                to="/"
                className="text-xs sm:text-sm font-serif text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors whitespace-nowrap"
              >
                <span className="hidden sm:inline">← Back to Home</span>
                <span className="sm:hidden">← Home</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-medium text-ink dark:text-ink-dark leading-tight mb-4 sm:mb-6 px-2">
              Choose Your Plan
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-600 dark:text-neutral-400 font-serif leading-relaxed mb-3 sm:mb-4 px-4">
              Unlock unlimited intelligence briefs, premium content, and priority access to our AI-powered news analysis.
            </p>
            <p className="text-sm sm:text-base md:text-lg text-primary dark:text-primary font-serif font-medium px-4">
              All pricing plans coming soon
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 md:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto">
            {plans.map((planItem) => (
              <div
                key={planItem.id}
                className={`relative flex flex-col p-6 sm:p-8 border-2 rounded-none transition-all duration-300 ${
                  planItem.highlight
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 md:scale-105 lg:scale-110 z-10 shadow-lg dark:shadow-primary/20'
                    : 'border-neutral-200 dark:border-neutral-800 bg-paper dark:bg-paper-dark hover:border-neutral-300 dark:hover:border-neutral-700'
                } ${plan === planItem.id ? 'ring-2 ring-primary' : ''}`}
              >
                {planItem.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 z-20">
                    <span className="bg-primary text-white px-3 sm:px-4 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div
                    className={`p-2 sm:p-2.5 rounded transition-colors ${
                      planItem.highlight
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {planItem.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-medium text-ink dark:text-ink-dark">
                    {planItem.name}
                  </h3>
                </div>

                <div className="mb-6 sm:mb-8">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-ink dark:text-ink-dark leading-none">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-serif italic mt-2 sm:mt-3">
                    {planItem.description}
                  </p>
                  <p className="text-[10px] sm:text-xs text-primary dark:text-primary font-serif mt-2">
                    Pricing details will be available soon
                  </p>
                </div>

                <ul className="flex-1 space-y-3 sm:space-y-4 mb-6 sm:mb-8 min-h-[200px] sm:min-h-[240px]">
                  {planItem.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm font-serif text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                  {planItem.limitations.map((limitation, idx) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-3">
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm font-serif text-neutral-500 dark:text-neutral-500 line-through leading-relaxed">
                        {limitation}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(planItem.id)}
                  className={`w-full py-3 sm:py-4 px-4 sm:px-6 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 ${
                    planItem.highlight
                      ? 'bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg'
                      : 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white'
                  }`}
                >
                  <span>Coming Soon</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 md:pb-20 lg:pb-24">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-ink dark:text-ink-dark text-center mb-8 sm:mb-10 md:mb-12 px-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5 sm:space-y-6">
            {[
              {
                q: 'What happens when service is exhausted?',
                a: 'Free users will see a message prompting them to upgrade to Premium. Premium users have priority access and alternative AI models to ensure uninterrupted service.',
              },
              {
                q: 'What is premium article content?',
                a: 'Some articles are marked as "ONLY AVAILABLE IN PAID PLANS". These are in-depth analyses, exclusive reports, and premium intelligence briefs that require a Premium or Enterprise subscription.',
              },
              {
                q: 'When will pricing plans be available?',
                a: 'All pricing plans are coming soon. We are currently finalizing our subscription offerings. Please check back later or contact us for early access.',
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a 30-day money-back guarantee for Premium subscriptions. Contact our support team for assistance.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border-b border-neutral-200 dark:border-neutral-800 pb-5 sm:pb-6"
              >
                <h3 className="text-base sm:text-lg font-serif font-medium text-ink dark:text-ink-dark mb-2 sm:mb-3">
                  {faq.q}
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-serif leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 md:pb-20 lg:pb-24 text-center">
          <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 md:p-10 lg:p-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-ink dark:text-ink-dark mb-3 sm:mb-4">
              Still have questions?
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-serif mb-6 sm:mb-8">
              Our team is here to help you choose the right plan for your needs.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:bg-primary dark:hover:bg-primary transition-colors"
            >
              Contact Us
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default PricingPage;

