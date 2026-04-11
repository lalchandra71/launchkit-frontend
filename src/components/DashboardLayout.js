import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI, orgAPI } from '../services/api';
import { useToast } from '../components/Toast';

const SidebarItem = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
      active
        ? 'bg-primary-50 text-primary-700'
        : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
    }`}
  >
    <span className="w-5 h-5">{icon}</span>
    {label}
  </Link>
);

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const currentPath = location.pathname;
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const storedOrg = localStorage.getItem('currentOrg');
    if (storedOrg) {
      try {
        const parsed = JSON.parse(storedOrg);
        setCurrentOrg(parsed);
      } catch {
        loadOrganizations();
      }
    } else {
      loadOrganizations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrganizations = async () => {
    try {
      const orgs = await orgAPI.list();
      if (orgs.length > 0) {
        const current = await orgAPI.getCurrent();
        setCurrentOrg(current);
        localStorage.setItem('currentOrg', JSON.stringify(current));
        localStorage.setItem('currentOrgId', current.id);
      } else {
        setShowOrgModal(true);
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
    }
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!orgName.trim()) {
      showError('Organization name is required');
      return;
    }
    setLoading(true);
    try {
      await orgAPI.create({ name: orgName });
      success('Organization created successfully!');
      setShowOrgModal(false);
      setOrgName('');
      loadOrganizations();
    } catch (err) {
      showError(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    localStorage.removeItem('user');
    success('Logged out successfully!');
    navigate('/login');
  };

  const canManageTeam = false;

  return (
    <div className="flex h-screen bg-surface-50">
      <aside className="w-60 bg-white border-r border-surface-200 flex flex-col">
        <div className="px-5 py-6">
          <h1 className="text-xl font-semibold text-surface-900">LaunchKit</h1>
        </div>
        <nav className="px-3 space-y-1 flex-1">
          <SidebarItem
            to="/dashboard"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
            label="Dashboard"
            active={currentPath === '/dashboard'}
          />
          
          <SidebarItem
            to="/dashboard/organization"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            label="Organizations"
            active={currentPath === '/dashboard/organization'}
          />

          <SidebarItem
            to="/dashboard/team"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            label="Team"
            active={currentPath === '/dashboard/team'}
          />
          <SidebarItem
            to="/dashboard/billing"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
            label="Billing"
            active={currentPath === '/dashboard/billing'}
          />
          <SidebarItem
            to="/dashboard/settings"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            label="Settings"
            active={currentPath === '/dashboard/settings'}
          />
        </nav>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-surface-200 px-6 py-4 flex justify-end">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-surface-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <span className="text-sm font-medium text-surface-700">{user.name || 'User'}</span>
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-elevated border border-surface-200 py-2 z-10">
                <div className="px-4 py-3 border-b border-surface-100">
                  <p className="text-sm font-medium text-surface-900">{user.name}</p>
                  <p className="text-xs text-surface-500">{user.email}</p>
                  {currentOrg && canManageTeam && (
                    <p className="text-xs text-primary-600 mt-1.5 font-medium">
                      {currentOrg.name}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </header>
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>

      {showOrgModal && (
        <div className="fixed inset-0 bg-surface-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-elevated p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-surface-900 mb-2">
              Welcome to LaunchKit
            </h3>
            <p className="text-sm text-surface-500 mb-6">
              Create your first organization to get started.
            </p>
            <form onSubmit={handleCreateOrg}>
              <div className="mb-5">
                <label className="label">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Inc."
                  className="input"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Creating...' : 'Create Organization'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;