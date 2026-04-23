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
    { 
      label: 'Team Members', 
      value: orgData?.memberCount || 0, 
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      iconColor: 'text-blue-600'
    },
    { 
      label: 'API Keys', 
      value: orgData?.metrics?.apiKeysCount || 0, 
      icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
      iconColor: 'text-amber-600'
    },
    { 
      label: 'Projects', 
      value: orgData?.metrics?.projectsCount || 0, 
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      iconColor: 'text-emerald-600'
    },
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
        <div className="max-w-6xl">
          <div className="animate-pulse">
            <div className="mb-8">
              <div className="h-8 w-48 bg-surface-200 rounded-2xl mb-2" />
              <div className="h-4 w-72 bg-surface-100 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 w-20 bg-surface-200 rounded-full mb-3" />
                      <div className="h-10 w-16 bg-surface-200 rounded-xl" />
                    </div>
                    <div className="w-14 h-14 bg-surface-100 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900">Dashboard</h1>
          <p className="text-surface-500 mt-2">Here's what's happening with your organization</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="card p-6 card-hover group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-2">
                    {metric.label}
                  </p>
                  <p className="text-4xl font-bold text-surface-900">{metric.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${metric.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <svg className={`w-7 h-7 ${metric.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={metric.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 card p-6">
            <h3 className="text-lg font-bold text-surface-900 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/dashboard/team')}
                disabled={!canInvite}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left group ${
                  canInvite
                    ? 'border-primary-200 bg-primary-50/50 hover:border-primary-300 hover:bg-primary-50 hover:shadow-md'
                    : 'border-surface-100 bg-surface-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${canInvite ? 'bg-primary-600' : 'bg-surface-300'}`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <p className={`font-semibold ${canInvite ? 'text-surface-900' : 'text-surface-400'}`}>Invite Member</p>
                <p className="text-xs text-surface-500 mt-1">Add new team member</p>
              </button>

              <button
                onClick={() => navigate('/dashboard/settings')}
                disabled={!canManageBilling}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left group ${
                  canManageBilling
                    ? 'border-surface-200 bg-white hover:border-surface-300 hover:shadow-md'
                    : 'border-surface-100 bg-surface-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${canManageBilling ? 'bg-surface-700' : 'bg-surface-300'}`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <p className={`font-semibold ${canManageBilling ? 'text-surface-900' : 'text-surface-400'}`}>Create API Key</p>
                <p className="text-xs text-surface-500 mt-1">Generate new credentials</p>
              </button>

              <button
                onClick={() => navigate('/dashboard/billing')}
                disabled={!canManageBilling}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left group ${
                  canManageBilling
                    ? 'border-surface-200 bg-white hover:border-surface-300 hover:shadow-md'
                    : 'border-surface-100 bg-surface-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${canManageBilling ? 'bg-amber-500' : 'bg-surface-300'}`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className={`font-semibold ${canManageBilling ? 'text-surface-900' : 'text-surface-400'}`}>Upgrade Plan</p>
                <p className="text-xs text-surface-500 mt-1">Access more features</p>
              </button>

              <button
                onClick={() => navigate('/dashboard/settings')}
                className="p-4 rounded-2xl border-2 border-surface-200 bg-white hover:border-surface-300 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
                  <svg className="w-5 h-5 text-surface-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="font-semibold text-surface-900">Settings</p>
                <p className="text-xs text-surface-500 mt-1">Configure preferences</p>
              </button>
            </div>
          </div>

          {/* Usage & Limits */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-surface-900 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Usage
            </h3>
            <div className="space-y-5">
              {usageLimits.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2.5">
                    <span className="text-surface-600 font-medium">{item.label}</span>
                    <span className="font-bold text-surface-900">
                      {item.used.toLocaleString()} / {item.limit === 'Unlimited' ? 'Unlimited' : item.limit.toLocaleString()}
                    </span>
                  </div>
                  {item.limit !== 'Unlimited' && (
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${item.used >= item.limit ? 'bg-gradient-to-r from-red-500 to-red-600' : ''}`}
                        style={{ width: `${Math.min((item.used / item.limit) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
              {isFreePlan && (
                <div className="pt-2">
                  <p className="text-xs text-surface-500 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Upgrade to Pro for unlimited access
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-surface-900 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors">
                    <div className={`w-2.5 h-2.5 mt-2 rounded-full ${getActivityColor(activity.type)} shadow-sm`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-surface-900">{activity.message}</p>
                      <p className="text-xs text-surface-400 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0l-4-4m-4 4l-4 4" />
                    </svg>
                  </div>
                  <p className="text-sm text-surface-500">No recent activity</p>
                  <p className="text-xs text-surface-400 mt-1">Actions will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Billing Summary */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-surface-900 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Billing Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-surface-100">
                <span className="text-sm text-surface-600">Current Plan</span>
                <span className={`text-sm font-bold ${isFreePlan ? 'text-amber-600' : 'text-primary-600'}`}>
                  {currentPlan}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-surface-100">
                <span className="text-sm text-surface-600">Price</span>
                <span className="text-sm font-bold text-surface-900">
                  {isFreePlan ? 'Free' : `${currentPlanPrice}/mo`}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-surface-100">
                <span className="text-sm text-surface-600">Next Billing</span>
                <span className="text-sm font-bold text-surface-900">
                  {isFreePlan ? '—' : (subscription?.currentPeriodEnd 
                    ? new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—')}
                </span>
              </div>
              <button
                onClick={() => navigate('/dashboard/billing')}
                className="w-full mt-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl hover:from-primary-700 hover:to-primary-800 font-semibold text-sm transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
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