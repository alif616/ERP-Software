import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '' });

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => { const res = await API.get('/suppliers'); setSuppliers(res.data); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) { await API.put(`/suppliers/${editing._id}`, form); toast.success('Updated'); }
    else { await API.post('/suppliers', form); toast.success('Created'); }
    fetchSuppliers(); setModalOpen(false); resetForm();
  };
  const handleDelete = async (id) => { if (confirm('Delete?')) { await API.delete(`/suppliers/${id}`); toast.success('Deleted'); fetchSuppliers(); } };
  const resetForm = () => { setEditing(null); setForm({ name: '', contactPerson: '', email: '', phone: '', address: '' }); };
  const openEdit = (sup) => { setEditing(sup); setForm(sup); setModalOpen(true); };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6"><h1 className="text-3xl font-bold">Suppliers</h1><button onClick={() => { resetForm(); setModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2"><Plus size={18} /> Add Supplier</button></div>
      <div className="bg-white rounded shadow overflow-x-auto"><table className="min-w-full"><thead className="bg-gray-100"><tr><th>Name</th><th>Contact Person</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead><tbody>{suppliers.map(s => (<tr key={s._id} className="border-t"><td>{s.name}</td><td>{s.contactPerson}</td><td>{s.email}</td><td>{s.phone}</td><td><div className="flex gap-2"><button onClick={() => openEdit(s)}><Pencil size={18} className="text-blue-600" /></button><button onClick={() => handleDelete(s._id)}><Trash2 size={18} className="text-red-600" /></button></div></td></tr>))}</tbody></table></div>
      {modalOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"><div className="bg-white p-6 rounded w-96"><h2 className="text-xl mb-4">{editing ? 'Edit Supplier' : 'Add Supplier'}</h2><form onSubmit={handleSubmit} className="space-y-3"><input placeholder="Name" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required className="w-full p-2 border rounded" /><input placeholder="Contact Person" value={form.contactPerson} onChange={e => setForm({...form, contactPerson:e.target.value})} className="w-full p2 border rounded" /><input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} className="w-full p-2 border rounded" /><input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} className="w-full p-2 border rounded" /><textarea placeholder="Address" value={form.address} onChange={e => setForm({...form, address:e.target.value})} className="w-full p-2 border rounded" /><div className="flex justify-end gap-2"><button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1 border rounded">Cancel</button><button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button></div></form></div></div>)}
    </div>
  );
};

export default Suppliers;