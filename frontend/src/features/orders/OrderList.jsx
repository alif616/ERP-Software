import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus } from './orderSlice';
import { Eye, Download, Package, CheckCircle, Truck, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';

const OrderList = () => {
  const dispatch = useDispatch();
  const { orders, totalPages, loading } = useSelector((state) => state.orders);
  const { userInfo } = useSelector((state) => state.auth);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const isAdminOrManager = ['admin', 'manager'].includes(userInfo?.role);

  // Real-time notifications for new orders
  useSocket((newOrder) => {
    toast.success(`New order #${newOrder.orderNumber} - $${newOrder.totalAmount}`);
    dispatch(fetchOrders({ page, search }));
  }, null);

  useEffect(() => {
    dispatch(fetchOrders({ page, search }));
  }, [dispatch, page, search]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!window.confirm(`Change order status to "${newStatus}"?`)) return;
    setUpdatingStatus(orderId);
    try {
      await dispatch(updateOrderStatus({ id: orderId, status: newStatus })).unwrap();
      toast.success(`Order status updated to ${newStatus}`);
      dispatch(fetchOrders({ page, search }));
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const downloadInvoice = (orderId) => {
    window.open(`http://localhost:5000/api/orders/${orderId}/invoice`, '_blank');
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>{status}</span>;
  };

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        <button
          onClick={() => dispatch(fetchOrders({ page, search }))}
          className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-700"
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by order number or customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10">Loading orders...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Order #</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="border-t">
                  <td className="px-4 py-2 font-mono text-sm">{order.orderNumber}</td>
                  <td className="px-4 py-2">{order.customerName}</td>
                  <td className="px-4 py-2 font-semibold">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-2">{getStatusBadge(order.status)}</td>
                  <td className="px-4 py-2 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => viewOrderDetails(order)} className="text-blue-600 hover:text-blue-800" title="View Details">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => downloadInvoice(order._id)} className="text-green-600 hover:text-green-800" title="Download PDF">
                        <Download size={18} />
                      </button>
                      {isAdminOrManager && (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={updatingStatus === order._id}
                          className="text-sm border rounded px-1 py-0.5"
                        >
                          {statusOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan="6" className="text-center py-4">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
          <span className="px-3 py-1">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      )}

      {/* Order Details Modal */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Order #{selectedOrder.orderNumber}</h2>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            <div className="space-y-3">
              <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
              <p><strong>Email:</strong> {selectedOrder.customerEmail || 'N/A'}</p>
              <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              <p><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</p>
              <p><strong>Total Amount:</strong> <span className="font-bold">${selectedOrder.totalAmount.toFixed(2)}</span></p>
              <div>
                <strong>Items:</strong>
                <table className="min-w-full mt-2 border">
                  <thead className="bg-gray-100"><tr><th className="px-2 py-1">Product</th><th className="px-2 py-1">Qty</th><th className="px-2 py-1">Price</th><th className="px-2 py-1">Subtotal</th></tr></thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-2 py-1">{item.name}</td>
                        <td className="px-2 py-1 text-center">{item.quantity}</td>
                        <td className="px-2 py-1 text-right">${item.price.toFixed(2)}</td>
                        <td className="px-2 py-1 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => downloadInvoice(selectedOrder._id)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Download Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;