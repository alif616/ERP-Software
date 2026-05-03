import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * PrivateRoute Component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 * Optionally checks for required roles
 */
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { userInfo } = useSelector((state) => state.auth);
  
  // Not logged in
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(userInfo.role)) {
    // User doesn't have required role - redirect to dashboard or 403 page
    return <Navigate to="/" replace />;
  }
  
  // Render children or Outlet for nested routes
  return children ? children : <Outlet />;
};

export default PrivateRoute;