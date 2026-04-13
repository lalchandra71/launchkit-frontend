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
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [canInvite, setCanInvite] = useState(false);
  const [canRemoveMember, setCanRemoveMember] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canManageTeam = currentUserRole === 'admin';

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
        const currentMember = membersList.find(m => m.userId === user.id);
        setCurrentUserRole(currentMember?.role?.toLowerCase() || '');
        
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
      
      const currentMember = membersList.find(m => m.userId === user.id);
      setCurrentUserRole(currentMember?.role?.toLowerCase() || '');
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
      admin: 'bg-purple-50 text-purple-700',
      member: 'bg-blue-50 text-blue-700',
      viewer: 'bg-surface-100 text-surface-600',
      owner: 'bg-emerald-50 text-emerald-700',
    };
    const displayRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    return (
      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${styles[role.toLowerCase()] || styles.viewer}`}>
        {displayRole}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-surface-900">Team</h2>
            <p className="text-sm text-surface-500 mt-1">Manage your team members</p>
          </div>
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

        {canInvite && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold text-surface-900 mb-4">Invite User</h3>
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
                  {loading ? 'Inviting...' : 'Invite'}
                </button>
              </div>
            </div>
          </form>
        </div>
        )}

        {canInvite && pendingInvites.length > 0 && (
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Pending Invitations</h3>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface-50 rounded-xl">
                  <div>
                    <p className="font-medium text-surface-900">{invite.email}</p>
                    <p className="text-sm text-surface-500">Role: {invite.role}</p>
                    {invite.tempPassword && (
                      <p className="text-sm text-surface-600 font-mono mt-1">Password: {invite.tempPassword}</p>
                    )}
                    <p className="text-xs text-surface-400 mt-1">Expires: {invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => copyInviteLink(invite.inviteLink)}
                    className="btn btn-secondary text-sm"
                  >
                    Copy Link
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-200">
            <h3 className="text-lg font-semibold text-surface-900">Team Members</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Role</th>
                  {canManageTeam && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {members.length > 0 ? (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-surface-900">{member.name}</td>
                      <td className="px-6 py-4 text-sm text-surface-600">{member.email}</td>
                      <td className="px-6 py-4 text-sm text-surface-600">{member.organizationName}</td>
                      <td className="px-6 py-4">{getRoleBadge(member.role)}</td>
                      {canRemoveMember && (
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(member)}
                          disabled={member.role === 'owner'}
                          className="text-sm text-red-600 hover:text-red-700 font-medium disabled:text-surface-300 disabled:cursor-not-allowed"
                        >
                          Remove
                        </button>
                      </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={canManageTeam ? 5 : 4} className="px-6 py-12 text-center text-sm text-surface-500">
                      No members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Team;