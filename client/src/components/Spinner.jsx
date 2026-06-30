import React from 'react';

export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} border-4 border-primary border-t-transparent rounded-full animate-spin`} role="status" aria-label="Loading" />
    </div>
  );
}
