import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { orgAPI, billingAPI } from '../services/api';
import { useToast } from '../components/Toast';

const Settings = () => {
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState('api-keys');
  const [apiKeys, setApiKeys] = useState([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(true);
  const [currentOrgId, setCurrentOrgId] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokingKeyId, setRevokingKeyId] = useState(null);
  const [canManageApiKeys, setCanManageApiKeys] = useState(false);
  const [canDeleteAccount, setCanDeleteAccount] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const orgs = await orgAPI.list();
      if (orgs.length > 0) {
        const orgId = localStorage.getItem('currentOrgId') || orgs[0].id;
        setCurrentOrgId(orgId);
        localStorage.setItem('currentOrgId', orgId);
        
        const [dashboardData, settingsData] = await Promise.all([
          orgAPI.getDashboard(orgId),
          orgAPI.getSettings(orgId)
        ]);
        
        setCanManageApiKeys(dashboardData?.canManageApiKeys || false);
        setCanDeleteAccount(dashboardData?.canDeleteAccount || false);
        setApiKeys(settingsData.apiKeys || []);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setApiKeysLoading(false);
    }
  };

  const handleCreateApiKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim() || !currentOrgId) return;
    
    setCreating(true);
    try {
      const limitCheck = await billingAPI.checkApiKeyLimit(currentOrgId);
      if (!limitCheck.allowed) {
        showError(limitCheck.message || 'Please upgrade your plan to create more API keys.');
        return;
      }
      const result = await orgAPI.createApiKey(currentOrgId, newKeyName);
      setApiKeys([{
        id: result.id,
        name: result.name,
        key: result.key.substring(0, 12) + 'xxxxxxxxxxxxx',
        created: result.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        isActive: true,
      }, ...apiKeys]);
      setNewKeyName('');
      setShowCreateModal(false);
      success('API key created successfully!');
    } catch (err) {
      showError(err.message || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeApiKey = async () => {
    const keyId = revokingKeyId;
    setShowRevokeModal(false);
    setRevokingKeyId(null);
    
    try {
      await orgAPI.revokeApiKey(currentOrgId, keyId);
      setApiKeys(apiKeys.map(k => k.id === keyId ? { ...k, isActive: false } : k));
      success('API key revoked successfully!');
    } catch (err) {
      showError(err.message || 'Failed to revoke API key');
    }
  };

  const confirmRevoke = (keyId) => {
    setRevokingKeyId(keyId);
    setShowRevokeModal(true);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion initiated...');
    }
  };

  const copyToClipboard = (key) => {
    navigator.clipboard.writeText(key);
    success('Copied to clipboard!');
  };

  const tabs = [
    { id: 'api-keys', label: 'API Keys', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
    { id: 'danger', label: 'Danger Zone', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900">Settings</h1>
          <p className="text-surface-500 mt-1">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-surface-200">
          <nav className="-mb-px flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* API Keys Tab */}
        {activeTab === 'api-keys' && (
          <div className="space-y-6">
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-surface-200 bg-surface-50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  API Keys
                </h3>
                {canManageApiKeys && (
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New
                  </button>
                )}
              </div>
              <div className="p-6">
                {apiKeysLoading ? (
                  <div className="text-center text-surface-500 py-8">Loading...</div>
                ) : apiKeys.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-surface-900 mb-2">No API keys yet</h3>
                    <p className="text-sm text-surface-500 mb-4">Create your first API key to get started</p>
                    {canManageApiKeys && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary"
                      >
                        Create API Key
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {apiKeys.map((apiKey) => (
                      <div 
                        key={apiKey.id} 
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl transition-all ${
                          apiKey.isActive 
                            ? 'bg-surface-50 hover:bg-surface-100' 
                            : 'bg-surface-100 opacity-60'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-semibold text-surface-900">{apiKey.name}</p>
                            {apiKey.isActive ? (
                              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-surface-200 text-surface-600 border border-surface-300">
                                Revoked
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-mono text-surface-500 bg-surface-200 px-2 py-1 rounded inline-block mt-1">
                            {apiKey.key}
                          </p>
                          <p className="text-xs text-surface-400 mt-2">
                            Created: {apiKey.created}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(apiKey.key)}
                            disabled={!apiKey.isActive}
                            className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-xl transition-colors disabled:text-surface-300 disabled:cursor-not-allowed"
                          >
                            Copy
                          </button>
                          {canManageApiKeys && (
                            <button 
                              onClick={() => confirmRevoke(apiKey.id)}
                              disabled={!apiKey.isActive}
                              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:text-surface-300 disabled:cursor-not-allowed"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === 'danger' && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-200 bg-red-50">
              <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Danger Zone
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-surface-600 mb-6 leading-relaxed">
                Once you delete your account, there is no going back. Please be certain before proceeding.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={!canDeleteAccount}
                className="btn btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Account
              </button>
            </div>
          </div>
        )}

        {/* Create API Key Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-elevated-xl border border-surface-200 p-8 w-full max-w-md animate-scale-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-surface-900">Create API Key</h3>
              </div>
              <p className="text-sm text-surface-500 mb-6">Generate a new API key for your organization</p>
              <form onSubmit={handleCreateApiKey}>
                <div className="mb-6">
                  <label className="label">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production API Key"
                    className="input"
                    autoFocus
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-secondary px-6"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newKeyName.trim()}
                    className="btn btn-primary px-6"
                  >
                    {creating ? 'Creating...' : 'Create Key'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Revoke Modal */}
        {showRevokeModal && (
          <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-elevated-xl border border-surface-200 p-8 w-full max-w-md animate-scale-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-surface-900">Revoke API Key</h3>
              </div>
              <p className="text-sm text-surface-600 mb-6">
                Are you sure you want to revoke this API key? This action cannot be undone and will immediately invalidate the key.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRevokeModal(false);
                    setRevokingKeyId(null);
                  }}
                  className="btn btn-secondary px-6"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevokeApiKey}
                  className="btn btn-danger px-6"
                >
                  Revoke Key
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;