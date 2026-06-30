import React from 'react';
import { FiCoffee, FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-dark text-gray-300">
      <div className="container-max px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">

          {/* Brand — left */}
          <div>
            <div className="flex items-center gap-2 text-accent font-heading font-bold text-xl mb-3 sm:mb-4">
              <FiCoffee className="text-xl sm:text-2xl" />
              <span>DM Enterprice</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4 max-w-xs">
              Premium personalised products crafted with passion. From mugs to photo frames, we bring you the finest gifting experience.
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
              {[
                { Icon: FiInstagram, href: '#', label: 'Instagram' },
                { Icon: FiFacebook, href: 'https://www.facebook.com/share/1AzJA4BsmU/', label: 'Facebook' },
                { Icon: FiTwitter, href: '#', label: 'Twitter' },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="p-2 rounded-full bg-gray-700 hover:bg-primary transition-colors">
                  <Icon size={14} className="sm:w-4 sm:h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact — right */}
          <div className="md:text-right md:flex md:flex-col md:items-end">
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              {[
                { icon: FiMapPin, text: 'Daulatpur, Maheshtala' },
                { icon: FiPhone, text: '+91 8420078207' },
                { icon: FiMail, text: 'deep0002@gmail.com' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2 md:flex-row-reverse">
                  <Icon className="mt-0.5 text-accent flex-shrink-0" size={15} />
                  <span className="text-gray-400">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 sm:mt-10 pt-5 text-center text-xs sm:text-sm text-gray-500">
          <p>© {new Date().getFullYear()} DM Enterpricess. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
