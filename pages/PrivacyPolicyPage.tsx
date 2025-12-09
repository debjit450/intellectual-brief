import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Icons } from '../constants.tsx';

const PrivacyPolicyPage: React.FC = () => {
  const lastUpdated = new Date('2024-01-15').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <Helmet>
        <title>Privacy Policy • The Intellectual Brief</title>
        <meta name="description" content="Privacy Policy for The Intellectual Brief. Learn how we collect, use, and protect your personal information." />
        <link rel="canonical" href="https://theintellectualbrief.online/privacy" />
        <meta property="og:title" content="Privacy Policy • The Intellectual Brief" />
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
            Privacy Policy
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-12">
            Last updated: {lastUpdated}
          </p>

          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none font-serif">
            <section className="mb-12">
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                The Intellectual Brief ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you visit our website and use our services.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                By using The Intellectual Brief, you agree to the collection and use of information in 
                accordance with this policy.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                1. Information We Collect
              </h2>
              
              <h3 className="text-xl font-medium mb-4 mt-6 text-neutral-900 dark:text-neutral-100">
                1.1 Information You Provide
              </h3>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Account Information:</strong> If you create an account, we collect your name, email address, and any other information you choose to provide.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Content:</strong> Articles you bookmark, preferences you set, and any content you submit to us.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Communications:</strong> Information you provide when contacting us, including email correspondence.</span>
                </li>
              </ul>

              <h3 className="text-xl font-medium mb-4 mt-6 text-neutral-900 dark:text-neutral-100">
                1.2 Automatically Collected Information
              </h3>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Usage Data:</strong> Information about how you access and use our service, including IP address, browser type, device information, pages visited, time spent on pages, and referring URLs.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Cookies and Tracking:</strong> We use cookies and similar tracking technologies. See our <Link to="/cookies" className="text-primary hover:underline">Cookie Policy</Link> for details.</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                2. How We Use Your Information
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We use the information we collect to:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Provide, maintain, and improve our services</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Process your account registration and manage your account</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Personalize your experience and deliver content relevant to your interests</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Send you newsletters, updates, and marketing communications (with your consent)</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Respond to your inquiries and provide customer support</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Detect, prevent, and address technical issues and security threats</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Analyze usage patterns to improve our services</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span>Comply with legal obligations</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                3. Information Sharing and Disclosure
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              
              <h3 className="text-xl font-medium mb-4 mt-6 text-neutral-900 dark:text-neutral-100">
                3.1 Service Providers
              </h3>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We may share information with third-party service providers who perform services on our behalf, 
                such as hosting, analytics, email delivery, and customer support. These providers are contractually 
                obligated to protect your information.
              </p>

              <h3 className="text-xl font-medium mb-4 mt-6 text-neutral-900 dark:text-neutral-100">
                3.2 Advertising Partners
              </h3>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We work with advertising partners (such as Google AdSense) who may use cookies and similar 
                technologies to deliver personalized ads. See our <Link to="/cookies" className="text-primary hover:underline">Cookie Policy</Link> for more information.
              </p>

              <h3 className="text-xl font-medium mb-4 mt-6 text-neutral-900 dark:text-neutral-100">
                3.3 Legal Requirements
              </h3>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We may disclose information if required by law, court order, or government regulation, or to 
                protect our rights, property, or safety, or that of our users or others.
              </p>

              <h3 className="text-xl font-medium mb-4 mt-6 text-neutral-900 dark:text-neutral-100">
                3.4 Business Transfers
              </h3>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred 
                as part of that transaction.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                4. Data Security
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, no method of 
                transmission over the Internet or electronic storage is 100% secure.
              </p>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                We use encryption, secure authentication, and regular security assessments to safeguard your data.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                5. Your Rights and Choices
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="space-y-3 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Access:</strong> Request access to your personal information</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Correction:</strong> Request correction of inaccurate information</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Deletion:</strong> Request deletion of your personal information</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Opt-out:</strong> Unsubscribe from marketing communications</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Data Portability:</strong> Request a copy of your data in a portable format</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary mt-1.5 text-xs">◆</span>
                  <span><strong>Cookie Preferences:</strong> Manage cookie settings (see <Link to="/cookies" className="text-primary hover:underline">Cookie Policy</Link>)</span>
                </li>
              </ul>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 mt-6">
                To exercise these rights, please contact us at <a href="mailto:privacy@theintellectualbrief.online" className="text-primary hover:underline">privacy@theintellectualbrief.online</a>.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                6. Children's Privacy
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                Our services are not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If you believe we have collected information 
                from a child under 13, please contact us immediately.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                7. International Data Transfers
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                Your information may be transferred to and processed in countries other than your country of 
                residence. These countries may have data protection laws that differ from those in your country. 
                We take appropriate safeguards to ensure your information is protected in accordance with this 
                Privacy Policy.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                8. Changes to This Privacy Policy
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new Privacy Policy on this page and updating the "Last updated" date. You are 
                advised to review this Privacy Policy periodically.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                9. Contact Us
              </h2>
              <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                If you have questions about this Privacy Policy, please contact us at:
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

export default PrivacyPolicyPage;

