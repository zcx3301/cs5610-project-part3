import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuthUser } from "../security/AuthContext";
import '../style/layout.css';

export default function AppLayout() {
  const { user, logout } = useAuthUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div>
      <nav className="nav-container">
        <div className="nav-content">
          <div className="nav-links">
            <button className="nav-button" onClick={() => navigate('/app')}>Home</button>
            <button className="nav-button" onClick={() => navigate('/app/cart')}>Cart</button>
            <button className="nav-button" onClick={() => navigate('/app/amazon-products')}>Amazon Search</button>
            <button className="nav-button" onClick={() => navigate('/app/products/insert')}>Insert Product</button>
            <button className="nav-button" onClick={() => navigate('/app/reviews')}>Product Reviews</button>
            {user && (
              <button className="nav-button" onClick={() => navigate('/app/profile')}>Profile</button>
            )}
          </div>
          <div className="auth-section">
            {user ? (
              <>
                <span className="welcome-text">Welcome, {user.name}</span>
                <button className="login-button" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="login-button" onClick={() => navigate('/login')}>Login</button>
                <button className="register-button" onClick={() => navigate('/register')}>Register</button>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="content-container">
        <Outlet />
      </div>
    </div>
  );
}