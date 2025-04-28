import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout, authData } = useAuth();
  
  // Permission check function
  const hasPermission = (permissionName) => {
    if (!authData || !authData.permissions) return false;
    return authData.permissions.includes(permissionName);
  };

  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4">
        <li>
          <Link to="/" className="text-white">Home</Link>
        </li>

        {hasPermission('manage categories') && (
          <li>
            <Link to="/category" className="text-white">Category Manage</Link>
          </li>
        )}

        {(hasPermission('manage posts') || hasPermission('create posts') || hasPermission('moderate comments')) && (
          <li>
            <Link to="/manage-posts" className="text-white">Blog Manage</Link>
          </li>
        )}

        {hasPermission('manage users') && (
          <li>
            <Link to="/manage-users" className="text-white">User Manage</Link>
          </li>
        )}

        {token ? (
          <li>
            <Link onClick={() => logout()} className="text-white">Logout</Link>
          </li>
        ) : (
          <>
            <li>
              <Link to="/login" className="text-white">Login</Link>
            </li>
            <li>
              <Link to="/register" className="text-white">Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
