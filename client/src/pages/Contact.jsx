import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="bg-background">
      <div className="relative py-10 sm:py-14 md:py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/page-banner.jpg')" }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-2 sm:mb-3">Contact Us</h1>
          <p className="text-gray-300 text-sm sm:text-base">We'd love to hear from you</p>
        </div>
      </div>

      <div className="container-max px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12">

        {/* Form */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-dark mb-5 sm:mb-6">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name</label>
                <input id="name" type="text" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                <input id="email" type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="input-field" placeholder="your@email.com" />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input id="subject" type="text" required value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} className="input-field" placeholder="What's this about?" />
            </div>
            <div>
              <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea id="message" rows={4} required value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} className="input-field resize-none" placeholder="Your message..." />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              <FiSend size={16} />
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="space-y-5 sm:space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-dark mb-4 sm:mb-6">Store Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
              {[
                { icon: FiMapPin, title: 'Address', text: '123 Coffee Lane, Brew City, CA 90210' },
                { icon: FiPhone, title: 'Phone', text: '+1 (555) 123-4567' },
                { icon: FiMail, title: 'Email', text: 'hello@coffeehaven.com' },
                { icon: FiClock, title: 'Hours', text: 'Mon–Fri: 7am–9pm | Sat–Sun: 8am–8pm' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl shadow-sm">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="text-primary" size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-dark text-sm sm:text-base">{title}</p>
                    <p className="text-gray-500 text-xs sm:text-sm">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-sm h-48 sm:h-56 md:h-64">
            <iframe
              title="Coffee Haven Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100939.98555098693!2d-122.50764017948551!3d37.75781499657369!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan+Francisco%2C+CA!5e0!3m2!1sen!2sus!4v1234567890"
              className="w-full h-full border-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
