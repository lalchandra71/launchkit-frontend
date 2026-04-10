import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { orgAPI, inviteAPI } from '../services/api';
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

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canManageTeam = currentUserRole === 'owner' || currentUserRole === 'admin';

  useEffect(() => {
    loadOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrganizations = async () => {
    try {
      const orgs = await orgAPI.list();
      setOrganizations(orgs);
      if (orgs.length > 0) {
        setSelectedOrg(orgs[0].id);
        loadMembers(orgs[0].id);
        loadInvitations(orgs[0].id);
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
    }
  };

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

  const handleOrgChange = (orgId) => {
    setSelectedOrg(orgId);
    loadMembers(orgId);
    loadInvitations(orgId);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
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
      await orgAPI.removeMember(selectedOrg, member.id);
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
      admin: 'bg-purple-100 text-purple-800',
      member: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800',
      owner: 'bg-green-100 text-green-800',
    };
    const displayRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[role.toLowerCase()] || styles.viewer}`}>
        {displayRole}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Management</h2>

        {canManageTeam && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Invite User</h3>
          </div>
          <form onSubmit={handleInvite} className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="w-full sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                <select
                  value={selectedOrg}
                  onChange={(e) => handleOrgChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Inviting...' : 'Invite User'}
                </button>
              </div>
            </div>
          </form>
        </div>
        )}

        {canManageTeam && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Pending Invitations</h3>
            </div>
            <div className="p-6">
              {pendingInvites.length === 0 ? (
                <p className="text-sm text-gray-500">No pending invitations</p>
              ) : (
                <div className="space-y-4">
                  {pendingInvites.map((invite) => (
                    <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{invite.email}</p>
                        <p className="text-sm text-gray-500">Role: {invite.role}</p>
                        <p className="text-xs text-gray-400">Expires: {invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyInviteLink(invite.inviteLink)}
                          className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Copy Link
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  {canManageTeam && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.length > 0 ? (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.organizationName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(member.role)}</td>
                      {canManageTeam && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(member)}
                          disabled={member.role === 'owner'}
                          className="text-red-600 hover:text-red-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          Remove
                        </button>
                      </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={canManageTeam ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500">
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
