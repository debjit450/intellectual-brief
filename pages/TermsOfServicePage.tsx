import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Icons } from '../constants.tsx';

const TermsOfServicePage: React.FC = () => {
  const lastUpdated = new Date('2024-01-15').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <Helmet>
        <title>Terms of Service • The Intellectual Brief</title>
        <meta name="description" content="Terms of Service for The Intellectual Brief. Read our terms and conditions for using our platform." />
        <link rel="canonical" href="https://theintellectualbrief.online/terms" />
        <meta property="og:title" content="Terms of Service • The Intellectual Brief" />
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
            Terms of Service
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-12">
            Last updated: {lastUpdated}
          </p>

          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none font-serif">
            <section className="mb-12">
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                These Terms of Service ("Terms") govern your access to and use of The Intellectual Brief 
                website and services ("Service") operated by The Intellectual Brief ("we," "us," or "our").
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree 
                with any part of these Terms, you may not access the Service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                1. Acceptance of Terms
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                By accessing or using The Intellectual Brief, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms and our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. 
                If you do not agree to these Terms, you must not use our Service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                2. Description of Service
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                The Intellectual Brief provides curated news, analysis, and briefings on technology, business, 
                AI, markets, and policy. Our Service includes:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Access to articles, briefings, and editorial content</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>User accounts with bookmarking and personalization features</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>RSS feeds and content syndication</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Email newsletters and notifications (with your consent)</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                3. User Accounts
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                To access certain features, you may be required to create an account. You agree to:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Provide accurate, current, and complete information</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Maintain and update your account information</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Maintain the security of your account credentials</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Accept responsibility for all activities under your account</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Notify us immediately of any unauthorized access</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                4. Acceptable Use
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                You agree not to:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Use the Service for any illegal purpose or in violation of any laws</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Violate or infringe upon the rights of others, including intellectual property rights</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Transmit any harmful code, viruses, or malicious software</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Attempt to gain unauthorized access to our systems or networks</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Interfere with or disrupt the Service or servers</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Scrape, crawl, or use automated systems to access the Service without permission</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Impersonate any person or entity or misrepresent your affiliation</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Collect or harvest information about other users</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                5. Intellectual Property
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                The Service and its original content, features, and functionality are owned by The Intellectual 
                Brief and are protected by international copyright, trademark, patent, trade secret, and other 
                intellectual property laws.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                You may not:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Reproduce, distribute, or create derivative works without permission</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Use our trademarks, logos, or branding without authorization</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Remove any copyright or proprietary notices</span>
                </li>
              </ul>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mt-6">
                You may share links to our articles and quote brief excerpts for commentary or criticism, 
                provided you attribute The Intellectual Brief and link back to the original article.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                6. Third-Party Content and Links
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                Our Service may contain links to third-party websites, services, or content. We are not 
                responsible for the content, privacy policies, or practices of third parties. Your 
                interactions with third parties are solely between you and the third party.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                We may cite or reference third-party sources in our articles. We strive for accuracy but 
                are not responsible for errors in third-party content.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                7. Disclaimers
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER 
                EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, 
                FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We do not warrant that:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>The Service will be uninterrupted, secure, or error-free</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Defects will be corrected</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>The Service is free of viruses or other harmful components</span>
                </li>
              </ul>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mt-6">
                Our content is for informational purposes only and does not constitute financial, legal, 
                or professional advice. See our <Link to="/disclaimer" className="text-primary hover:underline">Disclaimer</Link> for more information.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                8. Limitation of Liability
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE INTELLECTUAL BRIEF SHALL NOT BE LIABLE FOR ANY 
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS 
                OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, 
                OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                Our total liability for any claims arising from or related to the Service shall not exceed 
                the amount you paid us in the twelve months preceding the claim, or $100, whichever is greater.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                9. Indemnification
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                You agree to indemnify, defend, and hold harmless The Intellectual Brief and its officers, 
                directors, employees, and agents from any claims, damages, losses, liabilities, and expenses 
                (including legal fees) arising from your use of the Service, violation of these Terms, or 
                infringement of any rights of another.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                10. Termination
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior 
                notice, for any reason, including breach of these Terms.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                You may terminate your account at any time by contacting us or using account deletion features 
                in your account settings.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                11. Governing Law
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
                without regard to its conflict of law provisions. Any disputes arising from these Terms or 
                the Service shall be resolved in the courts of [Your Jurisdiction].
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                12. Changes to Terms
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                We reserve the right to modify these Terms at any time. We will notify users of material 
                changes by posting the updated Terms on this page and updating the "Last updated" date. 
                Your continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                13. Contact Information
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="mt-4 p-6 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                <p className="text-lg text-neutral-700 dark:text-neutral-300">
                  <strong>The Intellectual Brief</strong><br />
                  Email: <a href="mailto:legal@theintellectualbrief.online" className="text-primary hover:underline">legal@theintellectualbrief.online</a><br />
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

export default TermsOfServicePage;

