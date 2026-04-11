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
      Paid: 'bg-emerald-50 text-emerald-700',
      Pending: 'bg-amber-50 text-amber-700',
      Failed: 'bg-red-50 text-red-700',
      open: 'bg-blue-50 text-blue-700',
      paid: 'bg-emerald-50 text-emerald-700',
      void: 'bg-surface-100 text-surface-600',
    };
    return (
      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${styles[status?.toLowerCase()] || 'bg-surface-100 text-surface-600'}`}>
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
            <button disabled className="w-full py-2.5 bg-emerald-50 text-emerald-700 font-medium rounded-xl cursor-default">
              Current Plan
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={loading || !canManageBilling}
              className="w-full py-2.5 text-red-600 border border-red-200 font-medium rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Cancel Plan'}
            </button>
          </div>
        );
      }
      return (
        <button disabled className="w-full py-2.5 bg-emerald-50 text-emerald-700 font-medium rounded-xl cursor-default">
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
            className="w-full py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processingPlan === plan.id ? 'Processing...' : 'Buy'}
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
            className="w-full py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processingPlan === plan.id ? 'Processing...' : 'Buy'}
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
            className="w-full py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processingPlan === plan.id ? 'Processing...' : 'Buy'}
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
      return `Next billing: ${new Date(currentPeriodEnd * 1000).toLocaleDateString()}`;
    }
    if (plan.price > 0) {
      return 'Billed monthly';
    }
    return null;
  };

  const getBadgeStyle = (planName) => {
    if (currentPlan === planName) {
      return 'Current';
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-surface-900">Billing</h2>
            <p className="text-sm text-surface-500 mt-1">Manage your subscription and billing</p>
          </div>
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

        {loadingData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-6 w-24 bg-surface-200 rounded mb-4"></div>
                  <div className="h-10 w-20 bg-surface-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-surface-200 rounded"></div>
                    <div className="h-4 w-full bg-surface-200 rounded"></div>
                    <div className="h-4 w-3/4 bg-surface-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {plans.map((plan) => {
                const planName = plan.id?.toLowerCase() || plan.name?.toLowerCase();
                const isCurrent = planName === currentPlan;
                const badge = getBadgeStyle(planName);
                
                return (
                  <div 
                    key={plan.id} 
                    className={`card p-6 ${isCurrent ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-surface-900">{plan.name}</h3>
                      {badge && (
                        <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-surface-900 mb-4">{getPlanPrice(plan)}</p>
                    <div className="space-y-3 mb-6">
                      {plan.features?.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-surface-600">
                          <svg className="w-4 h-4 mr-2.5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
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

            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-surface-200">
                <h3 className="text-lg font-semibold text-surface-900">Billing History</h3>
              </div>
              <div className="overflow-x-auto">
                {billingHistory.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-surface-50 border-b border-surface-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Invoice</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {billingHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-surface-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-surface-900">
                            {item.date ? new Date(item.date * 1000).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {item.url ? (
                              <button
                                onClick={() => {
                                  window.open(item.url, 'Invoice', 'width=800,height=600');
                                }}
                                className="text-primary-600 hover:text-primary-700 font-medium"
                              >
                                View Invoice
                              </button>
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-surface-900">
                            {item.amount ? `$${(item.amount / 100).toFixed(2)}` : '-'}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(item.status)}
                          </td>
                          <td className="px-6 py-4 text-sm"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-sm text-surface-500">
                    No billing history found
                  </div>
                )}
              </div>
            </div>

            {showCancelModal && (
              <div className="fixed inset-0 bg-surface-900/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-elevated p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold text-surface-900 mb-2">
                    Cancel Subscription
                  </h3>
                  <p className="text-sm text-surface-500 mb-6">
                    Are you sure you want to cancel your subscription? You will lose access to premium features.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowCancelModal(false)}
                      className="btn btn-secondary"
                    >
                      No, Keep Plan
                    </button>
                    <button
                      onClick={handleCancelPlan}
                      disabled={loading}
                      className="btn btn-danger"
                    >
                      {loading ? 'Cancelling...' : 'Yes, Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Billing;