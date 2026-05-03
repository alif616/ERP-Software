import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Eye } from 'lucide-react';

const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ supplierId: '', items: [], orderDate: new Date().toISOString().split('T')[0] });
  const [currentItem, setCurrentItem] = useState({ productId: '', name: '', quantity: 1, unitPrice: 0 });

  useEffect(() => { fetchPOs(); fetchSuppliers(); fetchProducts(); }, []);

  const fetchPOs = async () => { const res = await API.get('/purchase-orders'); setPurchaseOrders(res.data); };
  const fetchSuppliers = async () => { const res = await API.get('/suppliers'); setSuppliers(res.data); };
  const fetchProducts = async () => { const res = await API.get('/products?limit=100'); setProducts(res.data.products); };

  const addItem = () => {
    if (!currentItem.name || currentItem.quantity <= 0) return;
    setForm({ ...form, items: [...form.items, { ...currentItem, productId: currentItem.productId || null }] });
    setCurrentItem({ productId: '', name: '', quantity: 1, unitPrice: 0 });
  };
  const removeItem = (idx) => { setForm({ ...form, items: form.items.filter((_, i) => i !== idx) }); };
  const getTotal = () => form.items.reduce((sum, it) => sum + (it.quantity * it.unitPrice), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.supplierId || form.items.length === 0) return toast.error('Add supplier and items');
    try {
      await API.post('/purchase-orders', { ...form, totalAmount: getTotal() });
      toast.success('Purchase order created');
      setModalOpen(false); setForm({ supplierId: '', items: [], orderDate: new Date().toISOString().split('T')[0] });
      fetchPOs();
    } catch (err) { toast.error(err.response?.data?.message); }
  };

  const receiveOrder = async (id) => {
    await API.put(`/purchase-orders/${id}/receive`);
    toast.success('Order received, stock updated');
    fetchPOs();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6"><h1 className="text-3xl font-bold">Purchase Orders</h1><button onClick={() => setModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2"><Plus size={18} /> Create PO</button></div>
      <div className="bg-white rounded shadow overflow-x-auto"><table className="min-w-full"><thead className="bg-gray-100"><tr><th>PO Number</th><th>Supplier</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>{purchaseOrders.map(po => (<tr key={po._id} className="border-t"><td>{po.poNumber}</td><td>{po.supplierId?.name}</td><td>{new Date(po.orderDate).toLocaleDateString()}</td><td>${po.totalAmount?.toFixed(2)}</td><td><span className={`px-2 py-1 text-xs rounded ${po.status === 'received' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{po.status}</span></td><td>{po.status === 'pending' && <button onClick={() => receiveOrder(po._id)} className="text-green-600">Receive</button>}</td></tr>))}</tbody></table></div>
      {modalOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto"><div className="bg-white p-6 rounded w-full max-w-2xl my-8"><h2 className="text-xl mb-4">Create Purchase Order</h2><form onSubmit={handleSubmit}><select value={form.supplierId} onChange={e => setForm({...form, supplierId:e.target.value})} required className="w-full p-2 border rounded mb-3"><option value="">Select Supplier</option>{suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select><div className="border p-3 rounded mb-3"><h3>Items</h3><div className="flex gap-2 flex-wrap"><select value={currentItem.productId} onChange={e => { const p = products.find(pr => pr._id === e.target.value); setCurrentItem({ productId: p._id, name: p.name, quantity: 1, unitPrice: p.price }); }} className="border p-1"><option value="">Select product</option>{products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</select><input placeholder="Item Name" value={currentItem.name} onChange={e => setCurrentItem({...currentItem, name:e.target.value})} className="border p-1 w-40" /><input type="number" placeholder="Qty" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity:parseInt(e.target.value)})} className="border p-1 w-20" /><input type="number" placeholder="Unit Price" value={currentItem.unitPrice} onChange={e => setCurrentItem({...currentItem, unitPrice:parseFloat(e.target.value)})} className="border p-1 w-28" /><button type="button" onClick={addItem} className="bg-blue-600 text-white px-2 rounded">Add</button></div>{form.items.map((it, idx) => (<div key={idx} className="flex justify-between items-center mt-2 text-sm"><span>{it.name} x{it.quantity} @ ${it.unitPrice}</span><span>${(it.quantity*it.unitPrice).toFixed(2)}</span><button type="button" onClick={() => removeItem(idx)} className="text-red-600">Remove</button></div>))}<div className="text-right font-bold mt-2">Total: ${getTotal().toFixed(2)}</div></div><div className="flex justify-end gap-2"><button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1 border rounded">Cancel</button><button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Create PO</button></div></form></div></div>)}
    </div>
  );
};

export default PurchaseOrders;