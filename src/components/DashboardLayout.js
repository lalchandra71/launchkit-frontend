import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI, orgAPI } from '../services/api';
import { useToast } from '../components/Toast';

const SidebarItem = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`sidebar-item group relative overflow-hidden ${
      active ? 'sidebar-item-active' : 'text-surface-600'
    }`}
  >
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-600 rounded-full" />
    )}
    <span className="w-5 h-5 transition-transform group-hover:scale-110">{icon}</span>
    <span className="flex-1">{label}</span>
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
    <div className="flex h-screen bg-gradient-to-br from-surface-50 via-white to-surface-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-surface-200/60 flex flex-col shadow-soft">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-surface-100/50">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-surface-900 tracking-tight">LaunchKit</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
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

        {/* Footer */}
        <div className="px-3 py-4 border-t border-surface-100/50">
          <button
            onClick={handleLogout}
            className="sidebar-item w-full text-surface-600 hover:text-red-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/60 backdrop-blur-xl border-b border-surface-200/60 px-6 py-4 flex items-center justify-between shadow-soft">
          {/* Organization indicator */}
          {currentOrg && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50/50 rounded-xl border border-primary-100/50">
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-sm font-medium text-primary-700">{currentOrg.name}</span>
            </div>
          )}

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-surface-100 transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:shadow-lg transition-shadow">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-sm font-semibold text-surface-700">{user.name || 'User'}</span>
              <svg className={`w-4 h-4 text-surface-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-elevated-xl border border-surface-200 py-2 z-50 animate-scale-in">
                <div className="px-5 py-4 border-b border-surface-100">
                  <p className="text-sm font-bold text-surface-900">{user.name}</p>
                  <p className="text-xs text-surface-500 mt-0.5">{user.email}</p>
                  {currentOrg && canManageTeam && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 rounded-full bg-primary-500" />
                      <p className="text-xs text-primary-600 font-medium">
                        {currentOrg.name}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-5 py-3 text-sm text-surface-600 hover:bg-surface-50 flex items-center gap-3 group"
                >
                  <svg className="w-4 h-4 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>

      {/* Create Organization Modal */}
      {showOrgModal && (
        <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-elevated-xl border border-surface-200 p-8 w-full max-w-md animate-scale-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-surface-900">Welcome to LaunchKit</h3>
            </div>
            <p className="text-sm text-surface-500 mb-8">
              Create your first organization to get started with your SaaS journey.
            </p>
            <form onSubmit={handleCreateOrg}>
              <div className="mb-6">
                <label className="label">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Inc."
                  className="input"
                  autoFocus
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOrgModal(false)}
                  className="btn btn-secondary px-6"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary px-6"
                >
                  {loading ? 'Creating...' : 'Create Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;