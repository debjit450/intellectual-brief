import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Icons } from '../constants.tsx';
import logo from '/assets/logo.png';

const AboutPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>About • The Intellectual Brief</title>
        <meta name="description" content="Learn about The Intellectual Brief - a modern tech and business intelligence platform transforming noise into strategic clarity for decision-makers." />
        <link rel="canonical" href="https://theintellectualbrief.online/about" />
        <meta property="og:title" content="About • The Intellectual Brief" />
        <meta property="og:description" content="Learn about The Intellectual Brief - transforming noise into strategic clarity." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-paper dark:bg-paper-dark">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20">
          {/* Header */}
          <div className="mb-12">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors mb-8"
            >
              <Icons.ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            
            <div className="flex items-center gap-4 mb-8">
              <img src={logo} alt="The Intellectual Brief" className="w-16 h-16" />
              <div>
                <h1 className="text-4xl md:text-5xl font-serif font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  About The Intellectual Brief
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 font-serif italic">
                  Clarity in a noisy world.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none font-serif">
            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Our Mission
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                The Intellectual Brief was founded on a simple premise: in an era of information overload, 
                decision-makers need clarity, not noise. We curate and synthesize global developments across 
                technology, business, policy, and society, transforming complex narratives into executive-ready 
                briefings.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                Powered by advanced AI and human editorial oversight, we deliver strategic intelligence that 
                helps leaders navigate an increasingly complex world with confidence and insight.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                What We Do
              </h2>
              <ul className="space-y-4 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Curate</strong> the most significant developments across technology, AI, markets, venture capital, and policy</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Synthesize</strong> complex information into clear, actionable briefings for executives and decision-makers</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Analyze</strong> trends and implications that matter for strategic planning and competitive intelligence</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Deliver</strong> insights in a format designed for busy professionals who value depth over breadth</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Our Approach
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We combine the speed and scale of artificial intelligence with the judgment and context of 
                experienced editors. Our AI-powered systems scan thousands of sources daily, identifying 
                patterns and developments that warrant executive attention.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                Every briefing undergoes editorial review to ensure accuracy, relevance, and clarity. We 
                prioritize depth over speed, quality over quantity, and insight over information.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Our Values
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-medium mb-3 text-neutral-900 dark:text-neutral-100">Independence</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    We maintain editorial independence and are not influenced by advertisers, investors, or 
                    external stakeholders in our coverage decisions.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-3 text-neutral-900 dark:text-neutral-100">Accuracy</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    We verify facts, cite sources, and correct errors promptly. Accuracy is non-negotiable.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-3 text-neutral-900 dark:text-neutral-100">Clarity</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    We believe complex ideas can and should be communicated clearly. Jargon is avoided; 
                    precision is maintained.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-3 text-neutral-900 dark:text-neutral-100">Relevance</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    We focus on developments that matter for strategic decision-making, filtering out noise 
                    and highlighting signal.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Our Audience
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                The Intellectual Brief serves executives, investors, entrepreneurs, policymakers, and 
                professionals who need to stay informed about technology and business developments but 
                don't have time to sift through hundreds of articles daily. We're for those who value 
                depth, context, and strategic insight.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Contact & Inquiries
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                For editorial inquiries, partnership opportunities, or general questions, please visit our 
                <Link to="/contact" className="text-primary hover:underline"> Contact page</Link>.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                For press inquiries or media requests, please email <a href="mailto:press@theintellectualbrief.online" className="text-primary hover:underline">press@theintellectualbrief.online</a>.
              </p>
            </section>

            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8 mt-12">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;

