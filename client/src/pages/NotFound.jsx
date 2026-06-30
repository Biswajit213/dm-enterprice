import React from 'react';
import { Link } from 'react-router-dom';
import { FiCoffee } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <FiCoffee className="text-primary/30 mx-auto mb-6" size={80} />
        <h1 className="text-8xl font-heading font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-heading font-bold text-dark mb-3">Page Not Found</h2>
        <p className="text-gray-500 mb-8">Looks like this page went cold. Let's get you back on track.</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}
