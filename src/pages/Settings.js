import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { orgAPI } from '../services/api';
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

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-surface-900">Settings</h2>
          <p className="text-sm text-surface-500 mt-1">Manage your account settings</p>
        </div>

        <div className="mb-6 border-b border-surface-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'api-keys'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
              }`}
            >
              API Keys
            </button>
            <button
              onClick={() => setActiveTab('danger')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'danger'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
              }`}
            >
              Danger Zone
            </button>
          </nav>
        </div>

        {activeTab === 'api-keys' && (
          <div className="card overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-surface-900">API Keys</h3>
              {canManageApiKeys && (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Key
                </button>
              )}
            </div>
            <div className="p-6">
              {apiKeysLoading ? (
                <div className="text-center text-surface-500 py-8">Loading...</div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center text-surface-500 py-8">No API keys found</div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface-50 rounded-xl">
                      <div>
                        <p className="font-medium text-surface-900">{apiKey.name}</p>
                        <p className="text-sm font-mono text-surface-500 mt-1">{apiKey.key}</p>
                        <p className="text-xs text-surface-400 mt-1">Created: {apiKey.created} {!apiKey.isActive && <span className="text-red-600">(Revoked)</span>}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => copyToClipboard(apiKey.key)}
                          disabled={!apiKey.isActive}
                          className="px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium disabled:text-surface-300"
                        >
                          Copy
                        </button>
                        <button 
                          onClick={() => confirmRevoke(apiKey.id)}
                          disabled={!apiKey.isActive || !canManageApiKeys}
                          className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 font-medium disabled:text-surface-300 disabled:cursor-not-allowed"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-200">
              <h3 className="text-lg font-semibold text-surface-900">Danger Zone</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-surface-600 mb-5">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={!canDeleteAccount}
                className="btn btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-surface-900/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-elevated p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-surface-900 mb-2">Create API Key</h3>
              <p className="text-sm text-surface-500 mb-6">Generate a new API key for your organization</p>
              <form onSubmit={handleCreateApiKey}>
                <div className="mb-5">
                  <label className="label">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Production API Key"
                    className="input"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newKeyName.trim()}
                    className="btn btn-primary"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showRevokeModal && (
          <div className="fixed inset-0 bg-surface-900/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-elevated p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-surface-900 mb-2">
                Revoke API Key
              </h3>
              <p className="text-sm text-surface-500 mb-6">
                Are you sure you want to revoke this API key? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRevokeModal(false);
                    setRevokingKeyId(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevokeApiKey}
                  className="btn btn-danger"
                >
                  Revoke
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