import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useToast } from '../components/Toast';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [inviteInfo, setInviteInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard');
    }

    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    if (tokenParam && emailParam) {
      setInviteInfo({ token: tokenParam, email: emailParam });
      setFormData({ name: '' });
    }
  }, [navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (inviteInfo) {
        const result = await authAPI.signupWithInvite({ 
          name: formData.name, 
          email: inviteInfo.email, 
          inviteToken: inviteInfo.token 
        });
        localStorage.setItem('token', result.accessToken);
        localStorage.setItem('user', JSON.stringify(result.user));
        success('Account created! Redirecting...');
        navigate('/dashboard');
      } else {
        await authAPI.signup(formData);
        success('Account created successfully! Please login.');
        navigate('/login');
      }
    } catch (err) {
      showError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-semibold text-surface-900 hover:text-primary-600 transition-colors">LaunchKit</Link>
        </div>
        
        <div className="card p-8">
          {inviteInfo ? (
            <>
              <h2 className="text-xl font-semibold text-surface-900 mb-2">Join your team</h2>
              <div className="mb-6 p-4 bg-emerald-50 rounded-xl">
                <p className="text-sm text-emerald-700 font-medium">You've been invited to join</p>
                <p className="text-sm text-emerald-600 mt-1">{inviteInfo.email}</p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-surface-900 mb-2">Create your account</h2>
              <p className="text-sm text-surface-500 mb-6">Get started with LaunchKit</p>
            </>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="input"
                required
              />
            </div>

            {!inviteInfo && (
              <>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Creating account...' : (inviteInfo ? 'Join Team' : 'Create account')}
            </button>
          </form>

          {!inviteInfo && (
            <p className="text-center text-sm text-surface-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;