import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { billingAPI, orgAPI } from '../services/api';
import { useToast } from '../components/Toast';

const Billing = () => {
  const { success, error: showError } = useToast();
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

  const handleCheckout = async (plan) => {
    setLoading(true);
    try {
      const baseUrl = window.location.origin;
      const result = await billingAPI.checkout({ 
        plan, 
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

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }
    setLoading(true);
    try {
      await billingAPI.cancelSubscription(selectedOrg);
      success('Subscription cancelled successfully!');
      loadBillingData();
    } catch (err) {
      showError(err.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPortal = async () => {
    setLoading(true);
    try {
      const result = await billingAPI.getPortal(selectedOrg);
      if (result.url) {
        window.open(result.url, 'Stripe Portal', 'width=600,height=700,menubar=no,toolbar=no,location=no');
      }
    } catch (err) {
      showError(err.message || 'Failed to open portal');
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

  const currentPlan = (subscription?.plan || 'Free');
  const isFreePlan = currentPlan.toLowerCase() === 'free';
  const planStatus = subscription?.status;
  const currentPeriodEnd = subscription?.currentPeriodEnd;
  const planBadge = planStatus || (isFreePlan ? 'free' : 'active');
  const planBadgeStyle = planBadge === 'active' ? 'bg-green-100 text-green-800' : 
                         planBadge === 'past_due' ? 'bg-red-100 text-red-800' : 
                         planBadge === 'canceled' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800';

  const currentPlanData = plans.find(p => p.name.toLowerCase() === currentPlan.toLowerCase()) || plans[0];
  const features = currentPlanData?.features || [];

  const getNextPlan = () => {
    const planOrder = ['free', 'pro', 'enterprise'];
    const currentIndex = planOrder.indexOf(currentPlan.toLowerCase());
    if (currentIndex < planOrder.length - 1) {
      return plans.find(p => p.id === planOrder[currentIndex + 1]);
    }
    return null;
  };

  const nextPlan = getNextPlan();

  const handleUpgrade = () => {
    if (nextPlan?.priceId) {
      handleCheckout(nextPlan.id);
    }
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Current Plan
                  {planBadge && (
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 ${planBadgeStyle}`}>
                      {planBadge}
                    </span>
                  )}
                </h3>
              </div>
              <div className="p-6">
                {isFreePlan ? (
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                        <span className="text-2xl font-bold text-gray-600">{currentPlan}</span>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{currentPlan} Plan</p>
                        <p className="text-gray-500">{currentPlanData?.description || 'Get started with basic features'}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-6">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center text-green-600">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                    {nextPlan && (
                      <button
                        onClick={handleUpgrade}
                        disabled={loading || !nextPlan.priceId}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : `Upgrade to ${nextPlan.name} - $${nextPlan.price}/month`}
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                        <span className="text-2xl font-bold text-indigo-600">{currentPlan}</span>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{currentPlan} Plan</p>
                        {currentPeriodEnd && (
                          <p className="text-gray-500">Next billing date: {new Date(currentPeriodEnd * 1000).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mb-6">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center text-green-600">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleOpenPortal}
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
                      >
                        Manage Subscription
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-6 py-3 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors disabled:opacity-50"
                      >
                        Cancel Plan
                      </button>
                    </div>
                  </div>
                )}
              </div>
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