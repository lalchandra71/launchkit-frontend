import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Multi-tenant organizations',
      description: 'Create and manage multiple organizations with isolated data and settings.',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h8',
    },
    {
      title: 'Role-based access',
      description: 'Define roles and permissions for team members with granular control.',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M7 6V2a3 3 0 015.356-1.857M7 6V2c0-.656.126-1.283.356-1.857M7 6a3 3 0 015.356-1.857M7 6a3 3 0 015.356 1.857M9 18a3 3 0 01-3-3V9a3 3 0 013-3h2a3 3 0 013 3v6a3 3 0 01-3 3H9z',
    },
    {
      title: 'API key management',
      description: 'Generate and manage API keys with expiration and permissions.',
      icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
    },
    {
      title: 'Subscription billing',
      description: 'Integrated Stripe billing with plans, usage limits, and webhooks.',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    },
  ];

  const handleDemoLogin = async () => {
    try {
      const data = await authAPI.login({
        email: 'demo@launchkit.com',
        password: 'demo123',
      });
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-surface-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-xl font-semibold text-surface-900">LaunchKit</span>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">
                Sign in
              </Link>
              <Link to="/signup" className="btn btn-primary text-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-surface-900 tracking-tight">
            LaunchKit
          </h1>
          <p className="mt-6 text-xl text-surface-600 max-w-2xl mx-auto">
            Production-ready SaaS starter with billing, teams, and API access
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleDemoLogin}
              className="btn btn-primary px-8 py-3 text-base"
            >
              Try Demo
            </button>
            <Link
              to="/dashboard"
              className="btn btn-secondary px-8 py-3 text-base"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white border-y border-surface-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-surface-900 text-center mb-12">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center card-hover">
                <div className="w-12 h-12 mx-auto bg-primary-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-surface-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-surface-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="card p-8">
            <h2 className="text-xl font-semibold text-surface-900 mb-2 text-center">
              Try it instantly
            </h2>
            <p className="text-sm text-surface-500 mb-6 text-center">
              Use the demo credentials below
            </p>
            <div className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value="demo@launchkit.com"
                  readOnly
                  className="input bg-surface-50"
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="text"
                  value="demo123"
                  readOnly
                  className="input bg-surface-50"
                />
              </div>
              <button
                onClick={handleDemoLogin}
                className="btn btn-primary w-full"
              >
                Launch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-surface-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-surface-900 text-center mb-12">
            Dashboard Preview
          </h2>
          <div className="card p-4 shadow-elevated">
            <div className="rounded-xl overflow-hidden border border-surface-200">
              <div className="bg-surface-800 px-4 py-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="bg-surface-50 p-6">
                <div className="bg-white rounded-xl border border-surface-200 shadow-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-surface-900">Dashboard</h3>
                      <p className="text-sm text-surface-500">Overview of your organization</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-5 border border-surface-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-surface-500">Members</p>
                          <p className="text-3xl font-semibold text-surface-900 mt-1">3</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 border border-surface-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-surface-500">API Keys</p>
                          <p className="text-3xl font-semibold text-surface-900 mt-1">2</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 border border-surface-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-surface-500">Projects</p>
                          <p className="text-3xl font-semibold text-surface-900 mt-1">5</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 border border-surface-200 rounded-xl">
                      <h4 className="text-base font-semibold text-surface-900 mb-4">Quick Actions</h4>
                      <div className="space-y-3">
                        <div className="w-full flex items-center gap-3 px-4 py-3 bg-primary-600 text-white rounded-xl font-medium text-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          Invite Member
                        </div>
                        <div className="w-full flex items-center gap-3 px-4 py-3 bg-white text-surface-700 border border-surface-300 rounded-xl font-medium text-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          Create API Key
                        </div>
                      </div>
                    </div>
                    <div className="p-6 border border-surface-200 rounded-xl">
                      <h4 className="text-base font-semibold text-surface-900 mb-4">Usage & Limits</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-surface-600">Members</span>
                            <span className="font-medium text-surface-900">3 / 5</span>
                          </div>
                          <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                        <p className="text-xs text-surface-500">Upgrade to Pro for unlimited usage</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-surface-500 mt-4">
                  Dashboard glimpse - full access after signing in
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start building your SaaS faster
          </h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Get a production-ready foundation with authentication, billing, teams, and API access in minutes.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-700 font-medium rounded-xl hover:bg-primary-50 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-surface-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-surface-600">LaunchKit</span>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm text-surface-600 hover:text-surface-900">
              Sign in
            </Link>
            <Link to="/signup" className="text-sm text-surface-600 hover:text-surface-900">
              Sign up
            </Link>
          </div>
          <span className="text-sm text-surface-500">Built with LaunchKit</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;