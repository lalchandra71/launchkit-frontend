import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { billingAPI, orgAPI } from '../services/api';
import { useToast } from '../components/Toast';

const Billing = () => {
  const { error: showError } = useToast();
  const [subscription, setSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [canManageBilling, setCanManageBilling] = useState(false);

  useEffect(() => {
    loadOrganizations();
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await billingAPI.getPlans();
      setPlans(data || []);
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
  };

  useEffect(() => {
    const storedOrgId = localStorage.getItem('currentOrgId');
    if (storedOrgId) {
      setSelectedOrg(storedOrgId);
      loadPermissions(storedOrgId);
      loadBillingData(storedOrgId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPermissions = async (orgId) => {
    try {
      const dashboardData = await orgAPI.getDashboard(orgId);
      setCanManageBilling(dashboardData?.canManageBilling || false);
    } catch (err) {
      console.error('Failed to load permissions:', err);
    }
  };

  const loadOrganizations = async () => {
    try {
      const orgs = await orgAPI.list();
      setOrganizations(orgs);
    } catch (err) {
      console.error('Failed to load organizations:', err);
    }
  };

  const loadBillingData = async (orgId) => {
    setLoadingData(true);
    try {
      const [subData, historyData] = await Promise.all([
        billingAPI.getSubscription(orgId),
        billingAPI.getHistory(orgId),
      ]);
      setSubscription(subData);
      setBillingHistory(Array.isArray(historyData) ? historyData : (historyData.invoices || []));
    } catch (err) {
      console.error('Failed to load billing data:', err);
      setSubscription(null);
      setBillingHistory([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleOrgChange = (orgId) => {
    setSelectedOrg(orgId);
    localStorage.setItem('currentOrgId', orgId);
    loadPermissions(orgId);
    loadBillingData(orgId);
  };

  const handleCheckout = async (planId) => {
    setProcessingPlan(planId);
    try {
      const baseUrl = window.location.origin;
      const result = await billingAPI.checkout({ 
        plan: planId, 
        organizationId: selectedOrg,
        successUrl: `${baseUrl}/billing/success`,
        cancelUrl: `${baseUrl}/dashboard/billing`
      });
      if (result.url) {
        const checkoutWindow = window.open(result.url, 'Stripe Checkout', 'width=600,height=700,menubar=no,toolbar=no,location=no');
        
        const checkClosed = setInterval(() => {
          if (checkoutWindow.closed) {
            clearInterval(checkClosed);
            setProcessingPlan(null);
            loadBillingData(selectedOrg);
          }
        }, 500);
      }
    } catch (err) {
      showError(err.message || 'Checkout failed');
      setProcessingPlan(null);
      setLoading(false);
    }
  };

  const handleCancelPlan = async () => {
    setShowCancelModal(false);
    setLoading(true);
    try {
      await billingAPI.cancelSubscription(selectedOrg);
      showError('Subscription cancelled successfully');
      loadBillingData(selectedOrg);
    } catch (err) {
      showError(err.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      pending: 'bg-amber-100 text-amber-700 border border-amber-200',
      failed: 'bg-red-100 text-red-700 border border-red-200',
      open: 'bg-blue-100 text-blue-700 border border-blue-200',
      void: 'bg-surface-100 text-surface-600 border border-surface-200',
    };
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${styles[status?.toLowerCase()] || 'bg-surface-100 text-surface-600'}`}>
        {status}
      </span>
    );
  };

  const currentPlan = (subscription?.plan || 'Free').toLowerCase();
  const currentPeriodEnd = subscription?.currentPeriodEnd;

  const getPlanButton = (plan) => {
    const planName = plan.id?.toLowerCase() || plan.name?.toLowerCase();
    const isCurrent = planName === currentPlan;
    const isPaidPlan = planName === 'pro' || planName === 'enterprise';

    if (isCurrent) {
      if (isPaidPlan) {
        return (
          <div className="space-y-3">
            <button disabled className="w-full py-3 bg-emerald-50 text-emerald-700 font-semibold rounded-2xl cursor-default border-2 border-emerald-200">
              Current Plan
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={loading || !canManageBilling}
              className="w-full py-2.5 text-red-600 border-2 border-red-200 font-medium rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Cancel Plan'}
            </button>
          </div>
        );
      }
      return (
        <button disabled className="w-full py-3 bg-emerald-50 text-emerald-700 font-semibold rounded-2xl cursor-default border-2 border-emerald-200">
          Current Plan
        </button>
      );
    }

    if (currentPlan === 'free') {
      if (planName === 'pro' || planName === 'enterprise') {
        return (
          <button
            onClick={() => handleCheckout(plan.id)}
            disabled={!plan.priceId || !canManageBilling}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-2xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {processingPlan === plan.id ? 'Processing...' : 'Upgrade Now'}
          </button>
        );
      }
    }

    if (currentPlan === 'pro') {
      if (planName === 'enterprise') {
        return (
          <button
            onClick={() => handleCheckout(plan.id)}
            disabled={!plan.priceId || !canManageBilling}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-2xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {processingPlan === plan.id ? 'Processing...' : 'Upgrade Now'}
          </button>
        );
      }
    }

    if (currentPlan === 'enterprise') {
      if (planName === 'pro') {
        return (
          <button
            onClick={() => handleCheckout(plan.id)}
            disabled={!plan.priceId || !canManageBilling}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-2xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {processingPlan === plan.id ? 'Processing...' : 'Downgrade'}
          </button>
        );
      }
    }

    return null;
  };

  const getPlanPrice = (plan) => {
    if (!plan.price || plan.price === 0) {
      return 'Free';
    }
    return `$${plan.price}/mo`;
  };

  const getPlanDate = (plan) => {
    const planName = plan.id?.toLowerCase() || plan.name?.toLowerCase();
    if (planName === 'free') {
      return 'No billing date';
    }
    if (currentPlan === planName && currentPeriodEnd) {
      return `Next billing: ${new Date(currentPeriodEnd * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    if (plan.price > 0) {
      return 'Billed monthly';
    }
    return null;
  };

  const getPlanBadge = (planName) => {
    if (currentPlan === planName) {
      return <span className="badge badge-primary">Current Plan</span>;
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl animate-fade-in">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">Billing & Plans</h1>
            <p className="text-surface-500 mt-1">Manage your subscription and billing</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedOrg}
              onChange={(e) => handleOrgChange(e.target.value)}
              className="input w-auto"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loadingData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-6 w-24 bg-surface-200 rounded-2xl mb-4" />
                <div className="h-10 w-20 bg-surface-200 rounded-2xl mb-4" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-surface-100 rounded-xl" />
                  <div className="h-4 w-full bg-surface-100 rounded-xl" />
                  <div className="h-4 w-3/4 bg-surface-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {plans.map((plan) => {
                const planName = plan.id?.toLowerCase() || plan.name?.toLowerCase();
                const isCurrent = planName === currentPlan;
                const badge = getPlanBadge(planName);
                const isPopular = planName === 'pro';
                
                return (
                  <div 
                    key={plan.id} 
                    className={`card p-6 relative border-2 transition-all duration-300 ${
                      isCurrent ? 'ring-2 ring-primary-500 ring-offset-2 border-primary-200' : 'border-surface-200'
                    } ${isPopular ? 'shadow-elevated-lg' : ''}`}
                  >
                    {isPopular && !isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-1 bg-gradient-to-r from-primary-500 to-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-surface-900">{plan.name}</h3>
                        {badge}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-surface-900">{getPlanPrice(plan)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {plan.features?.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2.5 text-sm text-surface-600">
                          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-surface-500">{getPlanDate(plan)}</p>
                    </div>
                    
                    {getPlanButton(plan)}
                  </div>
                );
              })}
            </div>

            {/* Billing History */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-surface-200 bg-surface-50">
                <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Billing History
                </h3>
              </div>
              <div className="overflow-x-auto">
                {billingHistory.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-surface-50 border-b border-surface-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-surface-600 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-surface-600 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-surface-600 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-surface-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-surface-600 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {billingHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-surface-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-surface-900">
                            {item.date ? new Date(item.date * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-surface-600">{item.description || 'Subscription'}</td>
                          <td className="px-6 py-4 text-sm font-bold text-surface-900">
                            {item.amount ? `$${(item.amount / 100).toFixed(2)}` : '-'}
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                          <td className="px-6 py-4">
                            {item.url && (
                              <button
                                onClick={() => {
                                  window.open(item.url, 'Invoice', 'width=800,height=600');
                                }}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                              >
                                View
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-surface-900 mb-2">No billing history</h3>
                    <p className="text-sm text-surface-500">Upgrade to a paid plan to see invoices</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-elevated-xl border border-surface-200 p-8 w-full max-w-md animate-scale-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-surface-900">Cancel Subscription</h3>
              </div>
              <p className="text-sm text-surface-600 mb-6">
                Are you sure you want to cancel your subscription? You will lose access to premium features immediately.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="btn btn-secondary px-6"
                >
                  Keep Plan
                </button>
                <button
                  onClick={handleCancelPlan}
                  disabled={loading}
                  className="btn btn-danger px-6"
                >
                  {loading ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Billing;