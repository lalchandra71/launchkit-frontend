const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authAPI = {
  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Signup failed');
    return data;
  },

  signupWithInvite: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup-with-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Signup failed');
    return data;
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    if (data.accessToken) {
      localStorage.setItem('authToken', data.accessToken);
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },
};

export const orgAPI = {
  create: async (orgData) => {
    const response = await fetch(`${API_BASE_URL}/org/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(orgData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Organization creation failed');
    return data;
  },

  list: async () => {
    const response = await fetch(`${API_BASE_URL}/org/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch organizations');
    return data;
  },

  getCurrent: async () => {
    const response = await fetch(`${API_BASE_URL}/org/current`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch current organization');
    return data;
  },

  getMembers: async (orgId) => {
    const response = await fetch(`${API_BASE_URL}/org/${orgId}/members`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch members');
    return data;
  },

  update: async (orgId, orgData) => {
    const response = await fetch(`${API_BASE_URL}/org/${orgId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(orgData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update organization');
    return data;
  },

  delete: async (orgId) => {
    const response = await fetch(`${API_BASE_URL}/org/${orgId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete organization');
    return data;
  },

  removeMember: async (orgId, memberId) => {
    const response = await fetch(`${API_BASE_URL}/org/${orgId}/members/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    if (response.status === 204 || response.status === 200) {
      return { success: true };
    }
    const text = await response.text();
    if (!response.ok) {
      const data = text ? JSON.parse(text) : { message: 'Failed to remove member' };
      throw new Error(data.message || 'Failed to remove member');
    }
    return { success: true };
  },

  getInvites: async (orgId) => {
    const response = await fetch(`${API_BASE_URL}/org/invite/${orgId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch invites');
    return data;
  },

  getDashboard: async (orgId) => {
    const response = await fetch(`${API_BASE_URL}/org/${orgId}/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch dashboard');
    return data;
  },

  getSettings: async (orgId) => {
    const response = await fetch(`${API_BASE_URL}/org/${orgId}/settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch settings');
    return data;
  },

  createApiKey: async (orgId, name) => {
    const response = await fetch(`${API_BASE_URL}/org/${orgId}/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create API key');
    return data;
  },

  revokeApiKey: async (orgId, keyId) => {
    const response = await fetch(`${API_BASE_URL}/org/${orgId}/api-keys/${keyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    if (response.status === 204 || response.status === 200) {
      return { success: true };
    }
    const text = await response.text();
    if (!response.ok) {
      const data = text ? JSON.parse(text) : { message: 'Failed to revoke API key' };
      throw new Error(data.message || 'Failed to revoke API key');
    }
    return { success: true };
  },
};

export const inviteAPI = {
  invite: async (inviteData) => {
    const payload = {
      email: inviteData.email,
      role: inviteData.role,
      organizationId: inviteData.orgId || inviteData.organizationId,
    };
    const response = await fetch(`${API_BASE_URL}/org/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Invitation failed');
    return data;
  },
};

export const billingAPI = {
  checkout: async (checkoutData) => {
    const response = await fetch(`${API_BASE_URL}/billing/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ 
        ...checkoutData, 
        organizationId: checkoutData.organizationId,
        successUrl: checkoutData.successUrl,
        cancelUrl: checkoutData.cancelUrl
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Checkout failed');
    return data;
  },

  getPlans: async () => {
    const response = await fetch(`${API_BASE_URL}/billing/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch plans');
    return data;
  },

  getHistory: async (organizationId) => {
    const response = await fetch(`${API_BASE_URL}/billing/history?organizationId=${organizationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch billing history');
    return data;
  },

  getSubscription: async (organizationId) => {
    const response = await fetch(`${API_BASE_URL}/billing/subscription?organizationId=${organizationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch subscription');
    return data;
  },

  cancelSubscription: async (organizationId) => {
    const response = await fetch(`${API_BASE_URL}/billing/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ organizationId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to cancel subscription');
    return data;
  },
};
