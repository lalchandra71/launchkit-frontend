import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { orgAPI } from '../services/api';
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
        await orgAPI.create({ name: formData.name });
        success('Organization created successfully!');
      }
      setShowModal(false);
      setEditingOrg(null);
      setFormData({ name: '' });
      loadOrganizations();
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
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-surface-900">Organizations</h2>
            <p className="text-sm text-surface-500 mt-1">Manage your organizations</p>
          </div>
          <button
            onClick={() => {
              setEditingOrg(null);
              setFormData({ name: '' });
              setShowModal(true);
            }}
            className="btn btn-primary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Organization
          </button>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {organizations.length > 0 ? (
                organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-surface-900">{org.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleEdit(org)}
                          disabled={!canEdit}
                          className="text-sm text-surface-600 hover:text-surface-900 font-medium disabled:text-surface-300 disabled:cursor-not-allowed"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(org)}
                          disabled={!canDeleteAccount}
                          className="text-sm text-red-600 hover:text-red-700 font-medium disabled:text-surface-300 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center text-sm text-surface-500">
                    No organizations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-surface-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-elevated p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-surface-900 mb-2">
              {editingOrg ? 'Edit Organization' : 'Create Organization'}
            </h3>
            <p className="text-sm text-surface-500 mb-6">
              {editingOrg ? 'Update organization details' : 'Add a new organization'}
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="label">Organization Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Acme Inc."
                  className="input"
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
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Saving...' : (editingOrg ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Organization;