import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Icons } from '../constants.tsx';

const AccessibilityPage: React.FC = () => {
  const lastUpdated = new Date('2024-01-15').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <Helmet>
        <title>Accessibility Statement • The Intellectual Brief</title>
        <meta name="description" content="Accessibility Statement for The Intellectual Brief. Our commitment to making our website accessible to all users." />
        <link rel="canonical" href="https://theintellectualbrief.online/accessibility" />
        <meta property="og:title" content="Accessibility Statement • The Intellectual Brief" />
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
            Accessibility Statement
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-12">
            Last updated: {lastUpdated}
          </p>

          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none font-serif">
            <section className="mb-12">
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                The Intellectual Brief is committed to ensuring digital accessibility for people with 
                disabilities. We are continually improving the user experience for everyone and applying 
                the relevant accessibility standards to achieve these goals.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Our Commitment
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA 
                standards. These guidelines explain how to make web content more accessible for people 
                with disabilities and user-friendly for everyone.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                We are committed to:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mt-4">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Making our website accessible to the widest possible audience</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Continuously improving accessibility based on user feedback</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Following best practices and accessibility standards</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Providing alternative ways to access our content</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Accessibility Features
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                Our website includes the following accessibility features:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Keyboard Navigation:</strong> All interactive elements can be accessed using a keyboard</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Screen Reader Support:</strong> Our content is structured to work with screen readers</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Alt Text:</strong> Images include descriptive alt text</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Color Contrast:</strong> We maintain sufficient color contrast ratios for text readability</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Text Resizing:</strong> Text can be resized using browser zoom controls</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Semantic HTML:</strong> We use proper HTML structure and semantic elements</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Dark Mode:</strong> Dark mode option for reduced eye strain</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Focus Indicators:</strong> Clear focus indicators for keyboard navigation</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Known Issues and Limitations
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                While we strive to ensure accessibility, we are aware that some areas of our website 
                may need improvement. We are working to address these issues and welcome feedback.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                Some third-party content or embedded elements may not fully meet accessibility standards. 
                We are working with our partners to improve this.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Feedback and Reporting Issues
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We welcome feedback on the accessibility of The Intellectual Brief. If you encounter 
                accessibility barriers, please let us know:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Email: <a href="mailto:accessibility@theintellectualbrief.online" className="text-primary hover:underline">accessibility@theintellectualbrief.online</a></span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Contact form: <Link to="/contact" className="text-primary hover:underline">Contact Page</Link></span>
                </li>
              </ul>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mt-6">
                When contacting us, please include:
              </p>
              <ul className="space-y-2 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mt-4">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>The URL of the page with the issue</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>A description of the accessibility barrier</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Your contact information (optional)</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Third-Party Content
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                Our website may include third-party content or links to third-party websites. We are 
                not responsible for the accessibility of third-party content. However, we encourage 
                our partners to maintain accessible websites.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Ongoing Improvements
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                Accessibility is an ongoing effort. We regularly review and update our website to 
                improve accessibility. This includes:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Regular accessibility audits</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>User testing with people with disabilities</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Training for our team on accessibility best practices</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Staying current with accessibility standards and guidelines</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Alternative Formats
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                If you need content in an alternative format, please contact us at 
                <a href="mailto:accessibility@theintellectualbrief.online" className="text-primary hover:underline"> accessibility@theintellectualbrief.online</a>. 
                We will work with you to provide content in a format that meets your needs.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Contact
              </h2>
              <div className="p-6 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                <p className="text-lg text-neutral-700 dark:text-neutral-300">
                  <strong>Accessibility Inquiries</strong><br />
                  Email: <a href="mailto:accessibility@theintellectualbrief.online" className="text-primary hover:underline">accessibility@theintellectualbrief.online</a><br />
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

export default AccessibilityPage;

