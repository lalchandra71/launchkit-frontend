import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { orgAPI } from '../services/api';
import { useToast } from '../components/Toast';

const Settings = () => {
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState('api-keys');
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentOrgId, setCurrentOrgId] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokingKeyId, setRevokingKeyId] = useState(null);
  const [canManageApiKeys, setCanManageApiKeys] = useState(false);
  const [canDeleteAccount, setCanDeleteAccount] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentOrg = await orgAPI.getCurrent();
      const dashboardData = await orgAPI.getDashboard(currentOrg.id);
      setCurrentOrgId(currentOrg.id);
      setCanManageApiKeys(dashboardData?.canManageApiKeys || false);
      setCanDeleteAccount(dashboardData?.canDeleteAccount || false);
      const settingsData = await orgAPI.getSettings(currentOrg.id);
      setApiKeys(settingsData.apiKeys || []);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'api-keys'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              API Keys
            </button>
            <button
              onClick={() => setActiveTab('danger')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'danger'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Danger Zone
            </button>
          </nav>
        </div>

        {activeTab === 'api-keys' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
                {canManageApiKeys && (
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                  >
                    Create New Key
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center text-gray-500">No API keys found</div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{apiKey.name}</p>
                        <p className="text-sm font-mono text-gray-500 mt-1">{apiKey.key}</p>
                        <p className="text-xs text-gray-400 mt-1">Created: {apiKey.created} {!apiKey.isActive && <span className="text-red-500">(Revoked)</span>}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(apiKey.key)}
                          disabled={!apiKey.isActive}
                          className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:text-gray-400"
                        >
                          Copy
                        </button>
                        <button 
                          onClick={() => confirmRevoke(apiKey.id)}
                          disabled={!apiKey.isActive || !canManageApiKeys}
                          className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 font-medium disabled:text-gray-400"
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Danger Zone</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={!canDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create API Key</h3>
              <form onSubmit={handleCreateApiKey}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production API Key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newKeyName.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showRevokeModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Revoke API Key
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to revoke this API key? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRevokeModal(false);
                    setRevokingKeyId(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevokeApiKey}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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