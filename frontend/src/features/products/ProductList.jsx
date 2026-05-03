import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, createProduct, updateProduct, deleteProduct, uploadProductImage, setLowStockAlert } from './productSlice';
import { Pencil, Trash2, Plus, X, Upload, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';

const ProductList = () => {
  const dispatch = useDispatch();
  const { products, totalPages, loading } = useSelector((state) => state.products);
  const { userInfo } = useSelector((state) => state.auth);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stock: '',
    minStock: '5',
    description: ''
  });

  const isAdminOrManager = ['admin', 'manager'].includes(userInfo?.role);

  // Real-time low stock alerts
  useSocket(null, (alert) => {
    toast.error(`⚠️ Low stock: ${alert.name} (${alert.stock} left)`);
    dispatch(fetchProducts({ page, search }));
    setLowStockAlerts(prev => [...prev, alert]);
    setTimeout(() => setLowStockAlerts(prev => prev.filter(a => a.productId !== alert.productId)), 30000);
  });

  useEffect(() => {
    dispatch(fetchProducts({ page, search }));
  }, [dispatch, page, search]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let product;
      if (editingProduct) {
        product = await dispatch(updateProduct({ id: editingProduct._id, productData: formData })).unwrap();
        if (imageFile) {
          const imageData = new FormData();
          imageData.append('image', imageFile);
          await dispatch(uploadProductImage({ id: editingProduct._id, imageData })).unwrap();
        }
        toast.success('Product updated');
      } else {
        product = await dispatch(createProduct(formData)).unwrap();
        if (imageFile) {
          const imageData = new FormData();
          imageData.append('image', imageFile);
          await dispatch(uploadProductImage({ id: product._id, imageData })).unwrap();
        }
        toast.success('Product created');
      }
      setIsModalOpen(false);
      resetForm();
      dispatch(fetchProducts({ page, search }));
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product? This action cannot be undone.')) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        toast.success('Product deleted');
        dispatch(fetchProducts({ page, search }));
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({ name: '', sku: '', category: '', price: '', stock: '', minStock: '5', description: '' });
    setImageFile(null);
    setImagePreview(null);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      stock: product.stock,
      minStock: product.minStock,
      description: product.description || ''
    });
    setImagePreview(product.imageUrl ? `http://localhost:5000${product.imageUrl}` : null);
    setIsModalOpen(true);
  };

  const isLowStock = (stock, minStock) => stock <= minStock;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-2">
          {isAdminOrManager && (
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus size={20} /> Add Product
            </button>
          )}
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="bg-yellow-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-yellow-700 relative"
          >
            <AlertTriangle size={20} />
            Alerts
            {lowStockAlerts.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {lowStockAlerts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Low Stock Alerts Panel */}
      {showAlerts && lowStockAlerts.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Low Stock Alerts</h3>
          {lowStockAlerts.map((alert, idx) => (
            <div key={idx} className="text-sm text-red-700">⚠️ {alert.name} - Only {alert.stock} left</div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Product Table */}
      {loading ? (
        <div className="text-center py-10">Loading products...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Image</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">SKU</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-center">Stock</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod._id} className={`border-t ${isLowStock(prod.stock, prod.minStock) ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-2">
                    {prod.imageUrl ? (
                      <img src={`http://localhost:5000${prod.imageUrl}`} alt={prod.name} className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs">No img</div>
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium">{prod.name}</td>
                  <td className="px-4 py-2 text-sm font-mono">{prod.sku}</td>
                  <td className="px-4 py-2">{prod.category}</td>
                  <td className="px-4 py-2 text-right">${prod.price.toFixed(2)}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={prod.stock <= prod.minStock ? 'text-red-600 font-bold' : ''}>{prod.stock}</span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {prod.stock <= prod.minStock ? (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Low Stock</span>
                    ) : (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">In Stock</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {isAdminOrManager && (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEditModal(prod)} className="text-blue-600 hover:text-blue-800">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(prod._id)} className="text-red-600 hover:text-red-800">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="8" className="text-center py-4">No products found</td></tr>
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleInputChange} required className="w-full p-2 border rounded" />
                <input type="text" name="sku" placeholder="SKU" value={formData.sku} onChange={handleInputChange} required className="w-full p-2 border rounded" />
                <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleInputChange} required className="w-full p-2 border rounded" />
                <input type="number" step="0.01" name="price" placeholder="Price" value={formData.price} onChange={handleInputChange} required className="w-full p-2 border rounded" />
                <input type="number" name="stock" placeholder="Stock Quantity" value={formData.stock} onChange={handleInputChange} required className="w-full p-2 border rounded" />
                <input type="number" name="minStock" placeholder="Minimum Stock Alert" value={formData.minStock} onChange={handleInputChange} className="w-full p-2 border rounded" />
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full p-2 border rounded"></textarea>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Product Image</label>
                  <div className="flex items-center gap-2">
                    {imagePreview && <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded" />}
                    <label className="bg-gray-600 text-white px-3 py-2 rounded cursor-pointer hover:bg-gray-700 flex items-center gap-1">
                      <Upload size={16} /> Upload
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;