import React, { useState } from 'react';
import './login.css'; 
import { useUser } from '../../../context/userContext'; 
import { useNavigate } from 'react-router-dom';

function Login() {
  const { login } = useUser(); // Iskoristi funkcije iz userContext-a
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in both fields');
      return;
    }

    setError(''); 
    try {
      const response = await fetch('http://localhost:8080/api/user/login', {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      // ceka odgovor
      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token)
        console.log('User logged in:', data); 

        navigate('/');
      } else {
        setError(data.message || 'Login failed'); 
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="loginContainer">
      <h2 className="title">Login</h2>
      <form onSubmit={handleSubmit} className="form">
        {error && <p className="error">{error}</p>}

        <div className="inputGroup">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="inputGroup">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="loginBtn">Login</button>
      </form>

      <p className="signupPrompt">
        Don't have an account? <a href="/signup" className="signupLink">Sign up</a>
      </p>
    </div>
  );
}

export default Login;
