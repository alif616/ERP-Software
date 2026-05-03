import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Truck,
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Define menu items with role-based visibility
  const menuItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
    { path: '/products', name: 'Products', icon: Package, roles: ['admin', 'manager', 'employee'] },
    { path: '/orders', name: 'Orders', icon: ShoppingCart, roles: ['admin', 'manager', 'employee'] },
    { path: '/employees', name: 'Employees', icon: Users, roles: ['admin', 'manager'] },
    { path: '/attendance', name: 'Attendance', icon: CalendarCheck, roles: ['admin', 'manager'] },
    { path: '/salaries', name: 'Salaries', icon: DollarSign, roles: ['admin'] },
    { path: '/transactions', name: 'Accounting', icon: TrendingUp, roles: ['admin', 'manager'] },
    { path: '/suppliers', name: 'Suppliers', icon: Truck, roles: ['admin', 'manager'] },
    { path: '/purchase-orders', name: 'Purchase Orders', icon: FileText, roles: ['admin', 'manager'] },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(userInfo?.role || 'employee')
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded lg:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-bold">ERP System</h1>
            <p className="text-sm text-gray-400 mt-1 capitalize">{userInfo?.role}</p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-800">
            <div className="mb-4 px-2">
              <p className="text-sm font-medium truncate">{userInfo?.name}</p>
              <p className="text-xs text-gray-400 truncate">{userInfo?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;