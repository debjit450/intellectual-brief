import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Icons } from '../constants.tsx';

const CookiePolicyPage: React.FC = () => {
  const lastUpdated = new Date('2024-01-15').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <Helmet>
        <title>Cookie Policy • The Intellectual Brief</title>
        <meta name="description" content="Cookie Policy for The Intellectual Brief. Learn about how we use cookies and tracking technologies." />
        <link rel="canonical" href="https://theintellectualbrief.online/cookies" />
        <meta property="og:title" content="Cookie Policy • The Intellectual Brief" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-paper dark:bg-paper-dark">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors mb-8"
          >
            <Icons.ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <h1 className="text-4xl md:text-5xl font-serif font-medium text-neutral-900 dark:text-neutral-100 mb-4">
            Cookie Policy
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-12">
            Last updated: {lastUpdated}
          </p>

          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none font-serif">
            <section className="mb-12">
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                This Cookie Policy explains how The Intellectual Brief ("we," "us," or "our") uses cookies 
                and similar tracking technologies on our website and how you can control them.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                By using our website, you consent to the use of cookies in accordance with this policy.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                What Are Cookies?
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                Cookies are small text files that are placed on your device when you visit a website. They 
                are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                We also use similar technologies such as web beacons, pixel tags, and local storage, which 
                we collectively refer to as "cookies" in this policy.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                How We Use Cookies
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
                We use cookies for the following purposes:
              </p>

              <h3 className="text-xl font-medium mb-4 mt-8 text-neutral-900 dark:text-neutral-100">
                Essential Cookies
              </h3>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                These cookies are necessary for the website to function properly. They enable core functionality 
                such as security, network management, and accessibility.
              </p>
              <ul className="space-y-2 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Authentication and session management</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Security and fraud prevention</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Load balancing and performance</span>
                </li>
              </ul>

              <h3 className="text-xl font-medium mb-4 mt-8 text-neutral-900 dark:text-neutral-100">
                Functional Cookies
              </h3>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                These cookies allow the website to remember choices you make and provide enhanced, personalized 
                features.
              </p>
              <ul className="space-y-2 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>User preferences (theme, language, etc.)</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Bookmarks and saved articles</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Personalized content recommendations</span>
                </li>
              </ul>

              <h3 className="text-xl font-medium mb-4 mt-8 text-neutral-900 dark:text-neutral-100">
                Analytics Cookies
              </h3>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                These cookies help us understand how visitors interact with our website by collecting and 
                reporting information anonymously.
              </p>
              <ul className="space-y-2 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Page views and navigation patterns</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Time spent on pages</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Error tracking and performance monitoring</span>
                </li>
              </ul>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                We use services like Google Analytics, which may set cookies on your device. You can opt-out 
                of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out Browser Add-on</a>.
              </p>

              <h3 className="text-xl font-medium mb-4 mt-8 text-neutral-900 dark:text-neutral-100">
                Advertising Cookies
              </h3>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                These cookies are used to deliver advertisements that are relevant to you and your interests. 
                They also help measure the effectiveness of advertising campaigns.
              </p>
              <ul className="space-y-2 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Targeted advertising based on your interests</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Frequency capping (limiting how many times you see an ad)</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Ad performance measurement</span>
                </li>
              </ul>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                We use Google AdSense for advertising. Google and its partners use cookies to serve ads based 
                on your prior visits to our website and other websites. You can opt-out of personalized 
                advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google's Ads Settings</a>.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Third-Party Cookies
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                In addition to our own cookies, we may also use various third-party cookies to report usage 
                statistics, deliver advertisements, and provide other services. These include:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Google Analytics:</strong> Website analytics and performance tracking</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Google AdSense:</strong> Advertising services</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Social Media Platforms:</strong> Social sharing and integration features</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Managing Cookies
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                You have the right to accept or reject cookies. Most web browsers automatically accept cookies, 
                but you can usually modify your browser settings to decline cookies if you prefer.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                However, if you choose to disable cookies, some features of our website may not function 
                properly.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
                Here's how to manage cookies in popular browsers:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Do Not Track Signals
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                Some browsers include a "Do Not Track" (DNT) feature that signals to websites you visit 
                that you do not want to have your online activity tracked. Currently, there is no standard 
                for how DNT signals should be interpreted. We do not currently respond to DNT browser signals.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Updates to This Policy
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                We may update this Cookie Policy from time to time. We will notify you of any material changes 
                by posting the new Cookie Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Contact Us
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                If you have questions about our use of cookies, please contact us:
              </p>
              <div className="mt-4 p-6 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                <p className="text-lg text-neutral-700 dark:text-neutral-300">
                  <strong>The Intellectual Brief</strong><br />
                  Email: <a href="mailto:privacy@theintellectualbrief.online" className="text-primary hover:underline">privacy@theintellectualbrief.online</a><br />
                  <Link to="/contact" className="text-primary hover:underline">Contact Page</Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookiePolicyPage;

