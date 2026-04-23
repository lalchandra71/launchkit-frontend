import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { orgAPI, billingAPI } from '../services/api';
import { useToast } from '../components/Toast';

const Organization = () => {
  const { success, error: showError } = useToast();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [canEdit, setCanEdit] = useState(false);
  const [canDeleteAccount, setCanDeleteAccount] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const orgs = await orgAPI.list();
      setOrganizations(orgs);
      if (orgs.length > 0) {
        const orgId = localStorage.getItem('currentOrgId') || orgs[0].id;
        localStorage.setItem('currentOrgId', orgId);
        
        const dashboardData = await orgAPI.getDashboard(orgId);
        setCanEdit(dashboardData?.canEdit || false);
        setCanDeleteAccount(dashboardData?.canDeleteAccount || false);
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showError('Organization name is required');
      return;
    }
    setLoading(true);
    try {
      if (editingOrg) {
        await orgAPI.update(editingOrg.id, { name: formData.name });
        success('Organization updated successfully!');
      } else {
        const limitCheck = await billingAPI.checkOrgLimit();
        if (!limitCheck.allowed) {
          showError(limitCheck.message || 'Please upgrade your plan to create more organizations.');
          return;
        }
        await orgAPI.create({ name: formData.name });
        success('Organization created successfully!');
      }
      setShowModal(false);
      setEditingOrg(null);
      setFormData({ name: '' });
      loadInitialData();
    } catch (err) {
      showError(err.message || 'Failed to save organization');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (org) => {
    setEditingOrg(org);
    setFormData({ name: org.name });
    setShowModal(true);
  };

  const handleDelete = async (org) => {
    if (!window.confirm(`Are you sure you want to delete "${org.name}"?`)) {
      return;
    }
    setLoading(true);
    try {
      await orgAPI.delete(org.id);
      success('Organization deleted successfully!');
      loadOrganizations();
    } catch (err) {
      showError(err.message || 'Failed to delete organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl animate-fade-in">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">Organizations</h1>
            <p className="text-surface-500 mt-1">Manage your organizations and settings</p>
          </div>
          <button
            onClick={() => {
              setEditingOrg(null);
              setFormData({ name: '' });
              setShowModal(true);
            }}
            className="btn btn-primary self-start"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Organization
          </button>
        </div>

        {/* Organizations Table */}
        <div className="card overflow-hidden">
          {organizations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-surface-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-surface-600 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-surface-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {organizations.map((org) => (
                    <tr key={org.id} className="table-row-hover group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary-700">
                              {org.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-semibold text-surface-900">{org.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600">
                        {org.createdAt ? new Date(org.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(org)}
                            disabled={!canEdit}
                            className="px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:text-surface-300 disabled:cursor-not-allowed"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(org)}
                            disabled={!canDeleteAccount}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:text-surface-300 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-surface-900 mb-2">No organizations found</h3>
              <p className="text-sm text-surface-500 mb-4">Create your first organization to get started</p>
              <button
                onClick={() => {
                  setEditingOrg(null);
                  setFormData({ name: '' });
                  setShowModal(true);
                }}
                className="btn btn-primary"
              >
                Create Organization
              </button>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-elevated-xl border border-surface-200 p-8 w-full max-w-md animate-scale-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-surface-900">
                  {editingOrg ? 'Edit Organization' : 'Create Organization'}
                </h3>
              </div>
              <p className="text-sm text-surface-500 mb-6">
                {editingOrg ? 'Update organization details' : 'Add a new organization to your account'}
              </p>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="label">Organization Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    placeholder="Acme Inc."
                    className="input"
                    autoFocus
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingOrg(null);
                      setFormData({ name: '' });
                    }}
                    className="btn btn-secondary px-6"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary px-6"
                  >
                    {loading ? 'Saving...' : (editingOrg ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Organization;