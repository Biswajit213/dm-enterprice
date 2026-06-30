import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiCoffee } from 'react-icons/fi';
import api from '../services/api';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-primary font-heading font-bold text-2xl mb-8">
          <FiCoffee size={28} /> Coffee Haven
        </Link>

        {status === 'loading' && (
          <div>
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <FiCheckCircle className="text-green-500 mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-heading font-bold text-dark mb-2">Email Verified!</h2>
            <p className="text-gray-500 mb-6">Your account is now active. You can log in.</p>
            <Link to="/login" className="btn-primary inline-block">Go to Login</Link>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <FiXCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-heading font-bold text-dark mb-2">Verification Failed</h2>
            <p className="text-gray-500 mb-6">The link is invalid or has expired. Please register again.</p>
            <Link to="/register" className="btn-primary inline-block">Register Again</Link>
          </div>
        )}
      </div>
    </div>
  );
}
