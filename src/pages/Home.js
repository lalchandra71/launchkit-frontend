import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      title: 'Multi-tenant Organizations',
      description: 'Create and manage multiple organizations with isolated data and settings.',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h8',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50'
    },
    {
      title: 'Role-based Access',
      description: 'Define roles and permissions for team members with granular control.',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M7 6a3 3 0 015.356-1.857M7 6a3 3 0 015.356 1.857M9 18a3 3 0 01-3-3V9a3 3 0 013-3h2a3 3 0 013 3v6a3 3 0 01-3 3H9z',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      title: 'API Key Management',
      description: 'Generate and manage API keys with expiration and permissions.',
      icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'from-amber-50 to-orange-50'
    },
    {
      title: 'Subscription Billing',
      description: 'Integrated Stripe billing with plans, usage limits, and webhooks.',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'from-emerald-50 to-teal-50'
    },
  ];

  const stats = [
    { value: '10k+', label: 'Developers' },
    { value: '50k+', label: 'Organizations' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-surface-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-surface-900 tracking-tight">LaunchKit</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors">
                Sign in
              </Link>
              <Link to="/signup" className="btn btn-primary text-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background gradient decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold tracking-wide">
            🚀 Production-Ready SaaS Starter
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-surface-900 tracking-tight mb-6">
            Launch your SaaS in<br />
            <span className="gradient-text">minutes, not months</span>
          </h1>
          <p className="text-lg md:text-xl text-surface-600 max-w-2xl mx-auto leading-relaxed">
            A complete, production-ready foundation with authentication, billing, team management, and API access. Everything you need to build and scale.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="btn btn-primary px-10 py-4 text-base group"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Try Demo
            </Link>
            <Link
              to="/signup"
              className="btn btn-secondary px-10 py-4 text-base"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-bold text-surface-900">{stat.value}</p>
                <p className="text-sm text-surface-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white border-y border-surface-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              Everything you need to scale
            </h2>
            <p className="text-lg text-surface-600 max-w-2xl mx-auto">
              LaunchKit provides all the essential building blocks for your SaaS application so you can focus on what matters most - your product.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative p-6 rounded-3xl border border-surface-200 hover:border-primary-200 transition-all duration-300 hover:shadow-elevated-lg bg-gradient-to-br from-white to-surface-50/50"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <svg className={`w-7 h-7 ${feature.iconColor || 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-surface-900 mb-2">{feature.title}</h3>
                <p className="text-surface-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to launch your SaaS?
          </h2>
          <p className="text-lg text-primary-100 mb-10 max-w-xl mx-auto">
            Join thousands of developers who trust LaunchKit to power their SaaS applications.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-10 py-4 bg-white text-primary-700 font-bold rounded-2xl hover:bg-primary-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Get Started Free
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Demo Login Section */}
      <section className="py-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="card p-8 hover:shadow-elevated-lg transition-shadow duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-surface-900 mb-2">Try it instantly</h2>
              <p className="text-sm text-surface-500">Use the demo credentials below to explore</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value="demo@launchkit.com"
                  readOnly
                  className="input bg-surface-50 font-mono text-sm"
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="text"
                  value="demo123"
                  readOnly
                  className="input bg-surface-50 font-mono text-sm"
                />
              </div>
              <Link
                to="/login"
                className="btn btn-primary w-full mt-2 justify-center"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-surface-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight">LaunchKit</span>
            </div>
            <div className="flex items-center gap-8">
              <Link to="/login" className="text-sm text-surface-400 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link to="/signup" className="text-sm text-surface-400 hover:text-white transition-colors">
                Sign up
              </Link>
              <span className="text-sm text-surface-400 cursor-pointer transition-colors hover:text-white">
                Documentation
              </span>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-surface-800 text-center">
            <p className="text-sm text-surface-500">
              © 2024 LaunchKit. Crafted with ❤️ for developers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
