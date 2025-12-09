import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Icons } from '../constants.tsx';

const EditorialPolicyPage: React.FC = () => {
  const lastUpdated = new Date('2024-01-15').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <Helmet>
        <title>Editorial Policy • The Intellectual Brief</title>
        <meta name="description" content="Editorial Policy and Standards for The Intellectual Brief. Learn about our commitment to accuracy, independence, and journalistic integrity." />
        <link rel="canonical" href="https://theintellectualbrief.online/editorial" />
        <meta property="og:title" content="Editorial Policy • The Intellectual Brief" />
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
            Editorial Policy & Standards
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-12">
            Last updated: {lastUpdated}
          </p>

          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none font-serif">
            <section className="mb-12">
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                The Intellectual Brief is committed to delivering accurate, independent, and insightful 
                journalism. This Editorial Policy outlines our standards, practices, and commitment to 
                editorial integrity.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Our Editorial Mission
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We aim to provide executive-ready briefings that transform complex information into clear, 
                actionable insights. Our content is designed for decision-makers who need depth, context, 
                and strategic perspective.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                We prioritize accuracy over speed, depth over breadth, and insight over information.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Editorial Independence
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                Our editorial decisions are made independently and are not influenced by:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Advertisers or sponsors</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Investors or stakeholders</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>External political or commercial pressures</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Personal relationships or conflicts of interest</span>
                </li>
              </ul>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mt-6">
                We maintain a strict separation between our editorial operations and business functions, 
                including advertising and partnerships.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Accuracy and Verification
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We are committed to accuracy in all our reporting:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Fact-Checking:</strong> All facts, figures, and claims are verified before publication</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Source Attribution:</strong> We cite sources and provide links to original materials when available</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Multiple Sources:</strong> We seek multiple sources for important claims when possible</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Corrections:</strong> We promptly correct errors and clearly mark corrections</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                AI-Generated Content
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                The Intellectual Brief uses artificial intelligence to assist in content creation, including:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Scanning and aggregating news from multiple sources</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Generating initial drafts of briefings</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Summarizing complex information</span>
                </li>
              </ul>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mt-6 mb-4">
                All AI-generated content undergoes human editorial review before publication. Our editors:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Verify facts and check for accuracy</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Ensure proper context and nuance</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Edit for clarity and style</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Add editorial judgment and analysis</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Conflicts of Interest
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                Our editorial team is required to disclose any potential conflicts of interest, including:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Financial interests in companies or topics we cover</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Personal relationships with sources or subjects</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Previous employment or consulting relationships</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Gifts, favors, or other benefits received</span>
                </li>
              </ul>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mt-6">
                When conflicts exist, we either recuse the affected editor or disclose the relationship 
                to readers when appropriate.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Corrections and Updates
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We are committed to correcting errors promptly and transparently:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Corrections are made as soon as errors are identified</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Corrections are clearly marked and dated</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Significant errors may be noted at the top or bottom of articles</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>We welcome reader feedback and corrections</span>
                </li>
              </ul>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mt-6">
                To report an error, please contact us at <a href="mailto:editorial@theintellectualbrief.online" className="text-primary hover:underline">editorial@theintellectualbrief.online</a>.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Opinion vs. News
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                The Intellectual Brief primarily focuses on news reporting and analysis. When we publish 
                opinion or commentary:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Opinion pieces are clearly labeled as such</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Analysis and interpretation are distinguished from factual reporting</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>We maintain a clear separation between news and opinion</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Source Protection
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We respect the confidentiality of sources who provide information on condition of anonymity. 
                We do not reveal the identity of confidential sources except in extraordinary circumstances 
                and only with the source's explicit consent.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                We protect sources from harm and do not publish information that could endanger sources 
                or others.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Diversity and Representation
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We strive to include diverse perspectives in our coverage and seek out sources from 
                different backgrounds, industries, and viewpoints. We are committed to fair and 
                accurate representation.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Reader Engagement
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We value feedback from our readers and encourage:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Corrections and fact-checking</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Story suggestions and tips</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Constructive criticism</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Questions about our coverage</span>
                </li>
              </ul>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mt-6">
                Contact our editorial team at <a href="mailto:editorial@theintellectualbrief.online" className="text-primary hover:underline">editorial@theintellectualbrief.online</a>.
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

export default EditorialPolicyPage;

