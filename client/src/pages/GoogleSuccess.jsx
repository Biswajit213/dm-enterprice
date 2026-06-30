import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

export default function GoogleSuccess() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      loginWithToken(token);
      toast.success('Logged in with Google!');
      navigate('/', { replace: true });
    } else {
      navigate('/login?error=google_failed', { replace: true });
    }
  }, []);

  return <Spinner size="lg" className="min-h-screen" />;
}
