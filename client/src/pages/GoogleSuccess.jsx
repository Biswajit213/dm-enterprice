import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

export default function GoogleSuccess() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get('token');

    if (!token) {
      toast.error('Google login failed. Please try again.');
      navigate('/login?error=google_failed', { replace: true });
      return;
    }

    // Store token immediately
    localStorage.setItem('token', token);

    // Trigger profile fetch then navigate
    loginWithToken(token)
      .then(() => {
        toast.success('Logged in with Google!');
        navigate('/', { replace: true });
      })
      .catch(() => {
        toast.error('Failed to load profile. Please try again.');
        navigate('/login', { replace: true });
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-gray-500 text-sm">Completing Google sign-in...</p>
    </div>
  );
}
