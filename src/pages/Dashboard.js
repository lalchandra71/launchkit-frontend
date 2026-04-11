import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { orgAPI, billingAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    loadDashboardData();
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

  const loadDashboardData = async () => {
    try {
      const currentOrg = await orgAPI.getCurrent();
      const dashboardData = await orgAPI.getDashboard(currentOrg.id);
      setOrgData(dashboardData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscription = orgData?.subscription;
  const currentPlan = subscription?.plan || 'Free';
  const isFreePlan = currentPlan.toLowerCase() === 'free';
  const canInvite = orgData?.canInvite || false;
  const canManageBilling = orgData?.canManageBilling || false;

  const currentPlanData = plans.find(p => p.name.toLowerCase() === currentPlan.toLowerCase());
  const currentPlanPrice = currentPlanData ? `$${currentPlanData.price}` : '$0';

  const metrics = [
    { label: 'Members', value: orgData?.memberCount || 0, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'API Keys', value: orgData?.metrics?.apiKeysCount || 0, icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
    { label: 'Projects', value: orgData?.metrics?.projectsCount || 0, icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  ];

  const recentActivity = orgData?.recentActivity || [];

  const usageLimits = [
    { label: 'Members', used: orgData?.usageLimits?.members?.used || 0, limit: isFreePlan ? 5 : 'Unlimited' },
  ];

  const getActivityColor = (type) => {
    const colors = {
      invite: 'bg-blue-500',
      key: 'bg-yellow-500',
      subscription: 'bg-green-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
          <div className="text-center py-8 text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={metric.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-3">
              <button
                onClick={() => navigate('/dashboard/team')}
                disabled={!canInvite}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  canInvite
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Invite Member
              </button>
              <button
                onClick={() => navigate('/dashboard/settings')}
                disabled={!canManageBilling}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  canManageBilling
                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Create API Key
              </button>
              <button
                onClick={() => navigate('/dashboard/billing')}
                disabled={!canManageBilling}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  canManageBilling
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Upgrade Plan
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Usage & Limits</h3>
            </div>
            <div className="p-4 space-y-4">
              {usageLimits.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="text-gray-900 font-medium">
                      {item.used.toLocaleString()} / {item.limit === 'Unlimited' ? 'Unlimited' : item.limit.toLocaleString()}
                    </span>
                  </div>
                  {item.limit !== 'Unlimited' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.used >= item.limit ? 'bg-red-500' : 'bg-indigo-600'}`}
                        style={{ width: `${Math.min((item.used / item.limit) * 100, 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
              {isFreePlan && (
                <p className="text-xs text-gray-500 mt-2">
                  Upgrade to Pro for unlimited usage
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-4">
              <ul className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <li key={index} className="flex items-start">
                    <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${getActivityColor(activity.type)}`}></div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Billing Snapshot</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Plan</span>
                  <span className="font-medium text-gray-900">{currentPlan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium text-gray-900">{isFreePlan ? 'Free' : `${currentPlanPrice}/month`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Billing</span>
                  <span className="font-medium text-gray-900">
                    {isFreePlan ? '—' : (subscription?.currentPeriodEnd 
                      ? new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString() 
                      : '—')}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/dashboard/billing')}
                  className="w-full mt-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-medium transition-colors"
                >
                  Manage Billing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;