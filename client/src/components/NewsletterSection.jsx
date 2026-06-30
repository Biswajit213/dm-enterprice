import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setLoading(true);
      await api.post('/newsletter', { email });
      toast.success('Subscribed successfully!');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-primary py-16 px-4">
      <div className="container-max text-center">
        <h2 className="text-3xl font-heading font-bold text-white mb-3">Stay in the Loop</h2>
        <p className="text-secondary mb-8 max-w-md mx-auto">
          Subscribe to get exclusive offers, new arrivals, and brewing tips delivered to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-4 py-3 rounded-lg bg-white text-dark focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Email for newsletter"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-accent text-dark font-semibold px-8 py-3 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  );
}
