import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Icons } from '../constants.tsx';

const DisclaimerPage: React.FC = () => {
  const lastUpdated = new Date('2024-01-15').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <Helmet>
        <title>Disclaimer • The Intellectual Brief</title>
        <meta name="description" content="Disclaimer for The Intellectual Brief. Important information about our content and services." />
        <link rel="canonical" href="https://theintellectualbrief.online/disclaimer" />
        <meta property="og:title" content="Disclaimer • The Intellectual Brief" />
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
            Disclaimer
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-12">
            Last updated: {lastUpdated}
          </p>

          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none font-serif">
            <section className="mb-12">
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                The information provided by The Intellectual Brief ("we," "us," or "our") on our website 
                and through our services is for general informational purposes only. All information is 
                provided in good faith, however we make no representation or warranty of any kind, express 
                or implied, regarding the accuracy, adequacy, validity, reliability, availability, or 
                completeness of any information.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Not Professional Advice
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                The content on The Intellectual Brief does not constitute:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Financial Advice:</strong> Our content is not intended as investment, financial, or trading advice. You should consult with a qualified financial advisor before making any investment decisions.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Legal Advice:</strong> Our content does not constitute legal advice. You should consult with a qualified attorney for legal matters.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Professional Advice:</strong> Our content is not a substitute for professional advice in any field, including but not limited to medical, legal, financial, or business matters.</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Investment Disclaimer
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                Any information related to investments, stocks, cryptocurrencies, or financial markets 
                is provided for informational purposes only and should not be construed as investment advice. 
                Past performance does not guarantee future results. All investments carry risk, and you 
                may lose money.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                We are not registered investment advisors, and we do not provide personalized investment 
                recommendations. Always conduct your own research and consult with qualified financial 
                professionals before making investment decisions.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Accuracy of Information
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                While we strive to provide accurate and up-to-date information, we cannot guarantee that 
                all information is complete, current, or error-free. Information may become outdated, 
                and we are under no obligation to update information.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                We rely on third-party sources for some information, and we are not responsible for errors 
                or omissions in those sources. We encourage readers to verify important information 
                independently.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Third-Party Content and Links
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                Our website may contain links to third-party websites, services, or content. We are not 
                responsible for:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>The content, accuracy, or opinions expressed on third-party websites</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>The privacy practices or policies of third-party websites</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Any damages or losses resulting from your use of third-party websites</span>
                </li>
              </ul>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mt-6">
                Links to third-party websites do not constitute an endorsement by The Intellectual Brief.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                AI-Generated Content
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                Some content on The Intellectual Brief is generated or assisted by artificial intelligence. 
                While we review and edit AI-generated content, AI systems may produce errors, inaccuracies, 
                or incomplete information. All content, regardless of how it was created, is subject to 
                the same disclaimers and limitations.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                No Warranties
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                THE INTELLECTUAL BRIEF PROVIDES THE SERVICE "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES 
                OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Warranties of merchantability</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Fitness for a particular purpose</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Non-infringement</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Accuracy, completeness, or reliability of information</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Limitation of Liability
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE INTELLECTUAL BRIEF SHALL NOT BE LIABLE FOR 
                ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF 
                PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, 
                GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Your use of or inability to use our Service</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Any errors or omissions in our content</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Any actions taken based on information provided on our Service</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Any unauthorized access to or use of our servers or data</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Use at Your Own Risk
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                Your use of The Intellectual Brief and reliance on any information provided is solely 
                at your own risk. We encourage you to verify important information independently and 
                consult with qualified professionals when making important decisions.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Changes to This Disclaimer
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                We reserve the right to modify this Disclaimer at any time. We will notify users of 
                material changes by posting the updated Disclaimer on this page and updating the "Last 
                updated" date.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Contact
              </h2>
              <div className="p-6 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
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

export default DisclaimerPage;

