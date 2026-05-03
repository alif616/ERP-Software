import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import SalesChart from '../components/Charts/SalesChart';
import { useSocket } from '../hooks/useSocket';
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalExpenses: 0,
    lowStockCount: 0,
    totalOrders: 0,
    totalEmployees: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useSocket((newOrder) => {
    // Update stats when new order arrives
    setStats(prev => ({ ...prev, totalSales: prev.totalSales + newOrder.totalAmount, totalOrders: prev.totalOrders + 1 }));
    setRecentOrders(prev => [newOrder, ...prev.slice(0, 4)]);
  }, null);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, salesRes, ordersRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/dashboard/sales-week'),
        API.get('/dashboard/recent-orders')
      ]);
      setStats(statsRes.data);
      setSalesData(salesRes.data);
      setRecentOrders(ordersRes.data);
    } catch (error) {
      console.error('Dashboard fetch error', error);
    }
  };

  const statCards = [
    { title: 'Total Sales', value: `$${stats.totalSales.toFixed(2)}`, icon: DollarSign, color: 'bg-blue-500' },
    { title: 'Total Expenses', value: `$${stats.totalExpenses.toFixed(2)}`, icon: DollarSign, color: 'bg-red-500' },
    { title: 'Low Stock Products', value: stats.lowStockCount, icon: Package, color: 'bg-yellow-500' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-green-500' },
    { title: 'Employees', value: stats.totalEmployees, icon: Users, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
            <div className={`${card.color} p-3 rounded-full text-white`}>
              <card.icon size={24} />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={salesData} title="Last 7 Days Sales" />
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500">No recent orders</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map(order => (
                <div key={order._id} className="flex justify-between items-center border-b pb-2">
                  <span className="font-mono text-sm">{order.orderNumber}</span>
                  <span>{order.customerName}</span>
                  <span className="font-bold">${order.totalAmount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;