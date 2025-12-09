import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Icons } from '../constants.tsx';

const MastheadPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Masthead • The Intellectual Brief</title>
        <meta name="description" content="Meet the editorial team and leadership of The Intellectual Brief." />
        <link rel="canonical" href="https://theintellectualbrief.online/masthead" />
        <meta property="og:title" content="Masthead • The Intellectual Brief" />
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
            Masthead
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-12">
            The team behind The Intellectual Brief
          </p>

          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none font-serif">
            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Leadership
              </h2>
              <div className="space-y-6">
                <div className="p-6 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                  <h3 className="text-xl font-medium mb-2 text-neutral-900 dark:text-neutral-100">Editor-in-Chief</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    The Intellectual Brief Editorial Team
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Editorial Team
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                Our editorial team combines experienced journalists, subject matter experts, and AI specialists 
                to deliver high-quality briefings. Our team members have backgrounds in technology, business, 
                finance, policy, and journalism.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                We maintain editorial independence and are committed to accuracy, clarity, and insight in 
                all our reporting.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Technology Team
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                Our technology team develops and maintains the AI systems, platforms, and infrastructure 
                that power The Intellectual Brief. They work closely with our editorial team to ensure 
                our tools enhance rather than replace human judgment.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Contributing Writers & Analysts
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We work with a network of contributing writers, analysts, and subject matter experts 
                who provide specialized knowledge and insights across technology, business, policy, and 
                markets.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Join Our Team
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We're always looking for talented individuals who share our commitment to clarity, 
                accuracy, and insight. If you're interested in joining our team, please visit our 
                <Link to="/contact" className="text-primary hover:underline"> Contact page</Link> or 
                email <a href="mailto:careers@theintellectualbrief.online" className="text-primary hover:underline">careers@theintellectualbrief.online</a>.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Contact
              </h2>
              <div className="p-6 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                <p className="text-lg text-neutral-700 dark:text-neutral-300">
                  <strong>Editorial Inquiries</strong><br />
                  Email: <a href="mailto:editorial@theintellectualbrief.online" className="text-primary hover:underline">editorial@theintellectualbrief.online</a><br />
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

export default MastheadPage;

