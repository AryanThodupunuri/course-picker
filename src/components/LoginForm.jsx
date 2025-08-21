import React, { useState } from 'react';

const LoginForm = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!credentials.email || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }

    if (isRegistering) {
      // Store user credentials in localStorage (simple demo)
      const users = JSON.parse(localStorage.getItem('courseplanners_users') || '[]');
      
      // Check if user already exists
      if (users.find(user => user.email === credentials.email)) {
        setError('User already exists with this email');
        return;
      }

      // Add new user
      users.push({
        email: credentials.email,
        password: credentials.password, // In real app, this would be hashed
        name: credentials.email.split('@')[0],
        createdAt: new Date().toISOString()
      });
      
      localStorage.setItem('courseplanners_users', JSON.stringify(users));
      
      // Auto login after registration
      const user = { email: credentials.email, name: credentials.email.split('@')[0] };
      localStorage.setItem('courseplanner_currentuser', JSON.stringify(user));
      onLogin(user);
    } else {
      // Login existing user
      const users = JSON.parse(localStorage.getItem('courseplanners_users') || '[]');
      const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
      
      if (user) {
        const userInfo = { email: user.email, name: user.name || user.email.split('@')[0] };
        localStorage.setItem('courseplanner_currentuser', JSON.stringify(userInfo));
        onLogin(userInfo);
      } else {
        setError('Invalid email or password');
      }
    }
  };

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, var(--uva-navy) 0%, #1a202c 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700', 
            color: 'var(--uva-navy)',
            margin: '0 0 0.5rem 0'
          }}>
            UVA Course Planner
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '0.875rem',
            margin: 0
          }}>
            {isRegistering ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fecaca',
            color: '#991b1b',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              marginBottom: '1rem',
              justifyContent: 'center'
            }}
          >
            {isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Switch between login/register */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setCredentials({ email: '', password: '' });
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--uva-orange)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isRegistering ? 'Sign in here' : 'Register here'}
          </button>
        </div>

        {/* Demo Account */}
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          background: '#f9fafb', 
          borderRadius: '0.375rem',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ 
            fontSize: '0.75rem', 
            color: '#6b7280', 
            margin: '0 0 0.5rem 0',
            fontWeight: '600'
          }}>
            Demo Account:
          </p>
          <p style={{ 
            fontSize: '0.75rem', 
            color: '#6b7280', 
            margin: '0',
            fontFamily: 'monospace'
          }}>
            Email: demo@uva.edu<br/>
            Password: demo123
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;