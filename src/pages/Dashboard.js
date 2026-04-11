import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { orgAPI, billingAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [orgData, setOrgData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const storedOrgId = localStorage.getItem('currentOrgId');
    if (storedOrgId) {
      loadDashboardData(storedOrgId);
    } else {
      loadDashboardData();
    }
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

  const loadDashboardData = async (orgId) => {
    try {
      let currentOrgId = orgId;
      if (!currentOrgId) {
        const current = await orgAPI.getCurrent();
        currentOrgId = current.id;
      }
      const dashboardData = await orgAPI.getDashboard(currentOrgId);
      setOrgData(dashboardData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setDataLoading(false);
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
      invite: 'bg-primary-500',
      key: 'bg-amber-500',
      subscription: 'bg-emerald-500',
    };
    return colors[type] || 'bg-surface-400';
  };

  if (dataLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-surface-900">Dashboard</h2>
              <p className="text-sm text-surface-500 mt-1">Overview of your organization</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-16 bg-surface-200 rounded mb-2"></div>
                    <div className="h-8 w-12 bg-surface-200 rounded"></div>
                  </div>
                  <div className="w-12 h-12 bg-surface-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-surface-900">Dashboard</h2>
            <p className="text-sm text-surface-500 mt-1">Overview of your organization</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500">{metric.label}</p>
                  <p className="text-3xl font-semibold text-surface-900 mt-1">{metric.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={metric.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard/team')}
                disabled={!canInvite}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  canInvite
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-surface-100 text-surface-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Invite Member
              </button>
              <button
                onClick={() => navigate('/dashboard/settings')}
                disabled={!canManageBilling}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  canManageBilling
                    ? 'bg-white text-surface-700 border border-surface-300 hover:bg-surface-50 hover:border-surface-400'
                    : 'bg-surface-100 text-surface-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Create API Key
              </button>
              <button
                onClick={() => navigate('/dashboard/billing')}
                disabled={!canManageBilling}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  canManageBilling
                    ? 'bg-white text-surface-700 border border-surface-300 hover:bg-surface-50 hover:border-surface-400'
                    : 'bg-surface-100 text-surface-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Upgrade Plan
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Usage & Limits</h3>
            <div className="space-y-5">
              {usageLimits.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-surface-600">{item.label}</span>
                    <span className="font-medium text-surface-900">
                      {item.used.toLocaleString()} / {item.limit === 'Unlimited' ? 'Unlimited' : item.limit.toLocaleString()}
                    </span>
                  </div>
                  {item.limit !== 'Unlimited' && (
                    <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${item.used >= item.limit ? 'bg-red-500' : 'bg-primary-500'}`}
                        style={{ width: `${Math.min((item.used / item.limit) * 100, 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
              {isFreePlan && (
                <p className="text-xs text-surface-500">
                  Upgrade to Pro for unlimited usage
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full ${getActivityColor(activity.type)}`}></div>
                    <div>
                      <p className="text-sm font-medium text-surface-900">{activity.message}</p>
                      <p className="text-xs text-surface-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-surface-500">No recent activity</p>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Billing</h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-surface-100">
                <span className="text-sm text-surface-600">Current Plan</span>
                <span className="text-sm font-medium text-surface-900">{currentPlan}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-surface-100">
                <span className="text-sm text-surface-600">Price</span>
                <span className="text-sm font-medium text-surface-900">{isFreePlan ? 'Free' : `${currentPlanPrice}/mo`}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-surface-100">
                <span className="text-sm text-surface-600">Next Billing</span>
                <span className="text-sm font-medium text-surface-900">
                  {isFreePlan ? '—' : (subscription?.currentPeriodEnd 
                    ? new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString() 
                    : '—')}
                </span>
              </div>
              <button
                onClick={() => navigate('/dashboard/billing')}
                className="w-full mt-2 px-4 py-2.5 bg-primary-50 text-primary-700 rounded-xl hover:bg-primary-100 font-medium text-sm transition-colors"
              >
                Manage Billing
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;