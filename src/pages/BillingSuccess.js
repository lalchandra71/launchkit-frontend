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
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 mb-4">
          <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-surface-900 mb-2">Payment Successful!</h2>
        <p className="text-sm text-surface-500">Redirecting to billing page...</p>
      </div>
    </div>
  );
};

export default BillingSuccess;