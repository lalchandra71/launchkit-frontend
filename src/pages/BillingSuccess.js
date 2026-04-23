import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

const BillingSuccess = () => {
  const navigate = useNavigate();
  const { success } = useToast();

  useEffect(() => {
    success('Payment successful! Your subscription has been updated.');
    
    const timer = setTimeout(() => {
      navigate('/dashboard/billing');
    }, 2000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-white to-surface-50">
      <div className="text-center animate-fade-in">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 mb-6 shadow-lg">
          <svg className="h-10 w-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-surface-900 mb-2">Payment Successful!</h1>
        <p className="text-surface-600 mb-8">Your subscription has been activated. Redirecting to billing...</p>
        
        {/* Spinner */}
        <div className="flex justify-center">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default BillingSuccess;