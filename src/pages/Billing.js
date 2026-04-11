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
    if (selectedOrg) {
      loadBillingData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrg]);

  const loadOrganizations = async () => {
    try {
      const orgs = await orgAPI.list();
      setOrganizations(orgs);
      if (orgs.length > 0) {
        const current = await orgAPI.getCurrent();
        setSelectedOrg(current.id);
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
    }
  };

  const loadBillingData = async () => {
    setLoadingData(true);
    try {
      const [subData, historyData] = await Promise.all([
        billingAPI.getSubscription(selectedOrg),
        billingAPI.getHistory(selectedOrg),
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
  };

  const handleCheckout = async (planId) => {
    setLoading(true);
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
            loadBillingData();
          }
        }, 500);
      }
    } catch (err) {
      showError(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async () => {
    setLoading(true);
    try {
      const result = await billingAPI.downgrade(selectedOrg);
      if (result.url) {
        window.open(result.url, 'Stripe Portal', 'width=600,height=700,menubar=no,toolbar=no,location=no');
        const checkClosed = setInterval(() => {
          clearInterval(checkClosed);
          loadBillingData();
        }, 2000);
      }
    } catch (err) {
      showError(err.message || 'Downgrade failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Paid: 'bg-green-100 text-green-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Failed: 'bg-red-100 text-red-800',
      open: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      void: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const currentPlan = (subscription?.plan || 'Free').toLowerCase();
  const currentPeriodEnd = subscription?.currentPeriodEnd;

  const getPlanButton = (plan) => {
    const planName = plan.id?.toLowerCase() || plan.name?.toLowerCase();
    const isCurrent = planName === currentPlan;

    if (isCurrent) {
      return (
        <button disabled className="w-full py-2 px-4 bg-green-100 text-green-700 font-medium rounded-lg cursor-default">
          Current Plan
        </button>
      );
    }

    if (currentPlan === 'free') {
      if (planName === 'pro' || planName === 'enterprise') {
        return (
          <button
            onClick={() => handleCheckout(plan.id)}
            disabled={loading || !plan.priceId}
            className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Upgrade'}
          </button>
        );
      }
    }

    if (currentPlan === 'pro') {
      if (planName === 'enterprise') {
        return (
          <button
            onClick={() => handleCheckout(plan.id)}
            disabled={loading || !plan.priceId}
            className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Upgrade'}
          </button>
        );
      }
      if (planName === 'free') {
        return (
          <button
            onClick={handleDowngrade}
            disabled={loading}
            className="w-full py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            {loading ? 'Processing...' : 'Downgrade'}
          </button>
        );
      }
    }

    if (currentPlan === 'enterprise') {
      if (planName === 'pro') {
        return (
          <button
            onClick={() => handleCheckout(plan.id)}
            disabled={loading || !plan.priceId}
            className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Upgrade'}
          </button>
        );
      }
      if (planName === 'free') {
        return (
          <button
            onClick={handleDowngrade}
            disabled={loading}
            className="w-full py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            {loading ? 'Processing...' : 'Downgrade'}
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Billing</h2>
          <select
            value={selectedOrg}
            onChange={(e) => handleOrgChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>

        {loadingData ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {plans.map((plan) => {
                const planName = plan.id?.toLowerCase() || plan.name?.toLowerCase();
                const isCurrent = planName === currentPlan;
                const badge = getBadgeStyle(planName);
                
                return (
                  <div 
                    key={plan.id} 
                    className={`bg-white rounded-lg shadow-sm border-2 ${isCurrent ? 'border-indigo-500' : 'border-gray-200'} p-6`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      {badge && (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-4">{getPlanPrice(plan)}</p>
                    <div className="space-y-2 mb-6">
                      {plan.features?.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">{getPlanDate(plan)}</p>
                    </div>
                    {getPlanButton(plan)}
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
              </div>
              <div className="overflow-x-auto">
                {billingHistory.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {billingHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.date ? new Date(item.date * 1000).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.url ? (
                              <button
                                onClick={() => {
                                  window.open(item.url, 'Invoice', 'width=800,height=600');
                                }}
                                className="text-indigo-600 hover:text-indigo-800 font-medium"
                              >
                                View Invoice
                              </button>
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.amount ? `$${(item.amount / 100).toFixed(2)}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(item.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500">
                    No billing history found
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Billing;