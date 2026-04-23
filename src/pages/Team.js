import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { orgAPI, inviteAPI, billingAPI } from '../services/api';
import { useToast } from '../components/Toast';

const Team = () => {
  const { success, error: showError } = useToast();
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [canInvite, setCanInvite] = useState(false);
  const [canRemoveMember, setCanRemoveMember] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadInitialData = React.useCallback(async () => {
    try {
      const orgs = await orgAPI.list();
      setOrganizations(orgs);
      if (orgs.length > 0) {
        const orgId = localStorage.getItem('currentOrgId') || orgs[0].id;
        setSelectedOrg(orgId);
        localStorage.setItem('currentOrgId', orgId);
        
        const [dashboardData, membersData, invitesData] = await Promise.all([
          orgAPI.getDashboard(orgId),
          orgAPI.getMembers(orgId),
          orgAPI.getInvites(orgId)
        ]);
        
        setCanInvite(dashboardData?.canInvite || false);
        setCanRemoveMember(dashboardData?.canRemoveMember || false);
        
        const membersList = Array.isArray(membersData) ? membersData : (membersData.members || []);
        const membersWithDetails = membersList.map(m => ({
          id: m.id,
          userId: m.userId,
          role: m.role,
          joinedAt: m.joinedAt,
          name: m.user?.name || (m.userId === user.id ? user.name : 'User'),
          email: m.user?.email || (m.userId === user.id ? user.email : 'user@example.com'),
          organizationName: m?.organizationName || 'Unknown',
        }));
        setMembers(membersWithDetails);
        setPendingInvites((invitesData || []).filter(inv => !inv.used));
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, [user.id, user.name, user.email]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadMembers = async (orgId) => {
    try {
      const data = await orgAPI.getMembers(orgId);
      const membersList = Array.isArray(data) ? data : (data.members || []);
      
      const membersWithDetails = membersList.map(m => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        name: m.user?.name || (m.userId === user.id ? user.name : 'User'),
        email: m.user?.email || (m.userId === user.id ? user.email : 'user@example.com'),
        organizationName: m?.organizationName || 'Unknown',
      }));
      setMembers(membersWithDetails);
    } catch (err) {
      console.error('Failed to load members:', err);
      setMembers([]);
    }
  };

  const loadInvitations = async (orgId) => {
    try {
      const data = await orgAPI.getInvites(orgId);
      setPendingInvites((data || []).filter(inv => !inv.used));
    } catch (err) {
      console.error('Failed to load invitations:', err);
      setPendingInvites([]);
    }
  };

  const handleOrgChange = async (orgId) => {
    setSelectedOrg(orgId);
    loadMembers(orgId);
    loadInvitations(orgId);
    const dashboardData = await orgAPI.getDashboard(orgId);
    setCanInvite(dashboardData?.canInvite || false);
    setCanRemoveMember(dashboardData?.canRemoveMember || false);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const limitCheck = await billingAPI.checkMemberLimit(selectedOrg);
      if (!limitCheck.allowed) {
        showError(limitCheck.message || 'Please upgrade your plan to add more members.');
        return;
      }
      await inviteAPI.invite({ 
        email: inviteEmail, 
        role: inviteRole,
        organizationId: selectedOrg 
      });
      setInviteEmail('');
      setInviteRole('member');
      loadInvitations(selectedOrg);
      success('Invitation sent successfully!');
    } catch (err) {
      showError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = (link) => {
    const fullLink = `${window.location.origin}${link}`;
    navigator.clipboard.writeText(fullLink);
    success('Invite link copied to clipboard!');
  };

  const handleDelete = async (member) => {
    if (member.role === 'owner') {
      showError('Cannot remove the organization owner');
      return;
    }
    setLoading(true);
    try {
      await orgAPI.removeMember(selectedOrg, member.userId);
      setMembers(members.filter(m => m.id !== member.id));
      success('Member removed successfully!');
    } catch (err) {
      showError(err.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-700 border border-purple-200',
      member: 'bg-blue-100 text-blue-700 border border-blue-200',
      viewer: 'bg-surface-100 text-surface-600 border border-surface-200',
      owner: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    };
    const displayRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${styles[role.toLowerCase()] || styles.viewer}`}>
        {displayRole}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl animate-fade-in">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">Team</h1>
            <p className="text-surface-500 mt-1">Manage team members and access</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedOrg}
              onChange={(e) => handleOrgChange(e.target.value)}
              className="input w-auto"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Invite Section */}
        {canInvite && (
          <div className="card p-6 mb-6 bg-gradient-to-br from-primary-50/50 to-white border-primary-100/50">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-surface-900">Invite Team Member</h3>
            </div>
            <form onSubmit={handleInvite}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="input"
                    required
                  />
                </div>
                <div className="w-full sm:w-40">
                  <label className="label">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="input"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading || !selectedOrg}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Invite'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Pending Invites */}
        {canInvite && pendingInvites.length > 0 && (
          <div className="card overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-surface-200 bg-surface-50">
              <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending Invitations ({pendingInvites.length})
              </h3>
            </div>
            <div className="divide-y divide-surface-100">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-surface-900">{invite.email}</p>
                        <p className="text-sm text-surface-500">Role: <span className="font-medium capitalize">{invite.role}</span></p>
                      </div>
                    </div>
                    {invite.tempPassword && (
                      <div className="mt-2 text-sm">
                        <span className="text-surface-500">Password: </span>
                        <code className="px-2 py-1 bg-surface-100 rounded text-surface-700 font-mono text-xs">{invite.tempPassword}</code>
                      </div>
                    )}
                    <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Expires: {invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => copyInviteLink(invite.inviteLink)}
                    className="btn btn-secondary text-sm self-start"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Members Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-200 bg-surface-50">
            <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Team Members ({members.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            {members.length > 0 ? (
              <table className="w-full">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-surface-600 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-surface-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-surface-600 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-surface-600 uppercase tracking-wider">Joined</th>
                    {canRemoveMember && (
                      <th className="px-6 py-3 text-left text-sm font-semibold text-surface-600 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {members.map((member) => (
                    <tr key={member.id} className="table-row-hover">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-surface-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600">{member.email}</td>
                      <td className="px-6 py-4">{getRoleBadge(member.role)}</td>
                      <td className="px-6 py-4 text-sm text-surface-500">
                        {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                      </td>
                      {canRemoveMember && (
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(member)}
                            disabled={member.role === 'owner'}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:text-surface-300 disabled:cursor-not-allowed"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">No team members yet</h3>
                <p className="text-sm text-surface-500 mb-4">Invite your first team member to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Team;