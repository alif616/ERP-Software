import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { fetchProducts } from '../features/products/productSlice';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

const CreateOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const res = await API.get('/products?limit=100');
    setProducts(res.data.products);
  };

  const addToCart = () => {
    const product = products.find(p => p._id === selectedProduct);
    if (!product) return;
    const existing = cart.find(item => item.productId === product._id);
    if (existing) {
      setCart(cart.map(item => 
        item.productId === product._id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        stock: product.stock
      }]);
    }
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || cart.length === 0) {
      toast.error('Please provide customer name and at least one product');
      return;
    }
    setLoading(true);
    try {
      await API.post('/orders', {
        customerName,
        customerEmail,
        items: cart.map(({ productId, quantity }) => ({ productId, quantity }))
      });
      toast.success('Order created successfully');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Order</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Customer Name *" value={customerName} onChange={e => setCustomerName(e.target.value)} className="border p-2 rounded" required />
            <input type="email" placeholder="Customer Email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="border p-2 rounded" />
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">Add Products</h2>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm">Product</label>
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full border p-2 rounded">
                <option value="">Select product</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (${p.price} - Stock: {p.stock})</option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="block text-sm">Qty</label>
              <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} className="w-full border p-2 rounded" />
            </div>
            <button type="button" onClick={addToCart} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1"><Plus size={18} /> Add</button>
          </div>
        </div>

        {cart.length > 0 && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-3">Cart</h2>
            <table className="w-full">
              <thead className="border-b"><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.productId} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                    <td><button type="button" onClick={() => removeFromCart(item.productId)} className="text-red-600"><Trash2 size={18} /></button></td>
                  </tr>
                ))}
                <tr className="font-bold"><td colSpan="3" className="text-right">Total:</td><td>${getTotal().toFixed(2)}</td><td></td></tr>
              </tbody>
            </table>
          </div>
        )}

        <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50">Place Order</button>
      </form>
    </div>
  );
};

export default CreateOrder;