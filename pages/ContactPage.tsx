import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Icons } from '../constants.tsx';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send the form data to a backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '', type: 'general' });
    }, 3000);
  };

  return (
    <>
      <Helmet>
        <title>Contact • The Intellectual Brief</title>
        <meta name="description" content="Contact The Intellectual Brief. Get in touch for editorial inquiries, partnerships, press requests, and more." />
        <link rel="canonical" href="https://theintellectualbrief.online/contact" />
        <meta property="og:title" content="Contact • The Intellectual Brief" />
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
            Contact Us
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-12">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Get in Touch
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-neutral-900 dark:text-neutral-100">General Inquiries</h3>
                  <a href="mailto:hello@theintellectualbrief.online" className="text-primary hover:underline">
                    hello@theintellectualbrief.online
                  </a>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-neutral-900 dark:text-neutral-100">Editorial</h3>
                  <a href="mailto:editorial@theintellectualbrief.online" className="text-primary hover:underline">
                    editorial@theintellectualbrief.online
                  </a>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Story tips, corrections, questions about coverage
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-neutral-900 dark:text-neutral-100">Press & Media</h3>
                  <a href="mailto:press@theintellectualbrief.online" className="text-primary hover:underline">
                    press@theintellectualbrief.online
                  </a>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Media inquiries, interview requests, press releases
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-neutral-900 dark:text-neutral-100">Partnerships</h3>
                  <a href="mailto:partnerships@theintellectualbrief.online" className="text-primary hover:underline">
                    partnerships@theintellectualbrief.online
                  </a>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Business partnerships, collaborations, sponsorships
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-neutral-900 dark:text-neutral-100">Privacy & Legal</h3>
                  <a href="mailto:privacy@theintellectualbrief.online" className="text-primary hover:underline">
                    privacy@theintellectualbrief.online
                  </a>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Privacy concerns, data requests, legal matters
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-neutral-100">Follow Us</h3>
                <div className="flex flex-col gap-2">
                  <a href="https://x.com/TIBReports" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    X (Twitter) / @TIBReports
                  </a>
                  <a href="https://www.linkedin.com/company/theintellectualbrief" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    LinkedIn
                  </a>
                  <a href="https://www.instagram.com/theintellectualbrief" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Instagram
                  </a>
                  <a href="https://www.youtube.com/@theintellectualbrief" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    YouTube
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-serif font-medium mb-6 text-neutral-900 dark:text-neutral-100">
                Send a Message
              </h2>
              
              {submitted ? (
                <div className="p-6 bg-primary/10 border border-primary rounded-lg">
                  <p className="text-primary font-medium">Thank you for your message! We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                      Inquiry Type
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-paper dark:bg-paper-dark text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="general">General Inquiry</option>
                      <option value="editorial">Editorial</option>
                      <option value="press">Press/Media</option>
                      <option value="partnership">Partnership</option>
                      <option value="privacy">Privacy/Legal</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-paper dark:bg-paper-dark text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-paper dark:bg-paper-dark text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-paper dark:bg-paper-dark text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                      Message
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-paper dark:bg-paper-dark text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;

