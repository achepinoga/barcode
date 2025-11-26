import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/api';
import '../styles/Header.css';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      // Call backend logout to clear cookie
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state regardless of API call result
      logout();
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="app-header">
      <h1>Barcode Management System</h1>
      <nav className="nav-links">
        <button
          className={`nav-btn ${isActive('/dashboard') ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          Scanner
        </button>
        <button
          className={`nav-btn ${isActive('/products') ? 'active' : ''}`}
          onClick={() => navigate('/products')}
        >
          Products
        </button>
        <button
          className={`nav-btn ${isActive('/reports') ? 'active' : ''}`}
          onClick={() => navigate('/reports')}
        >
          Reports
        </button>
      </nav>
      <div className="header-right">
        <span className="user-info">Logged in as: {user?.username}</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}