import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'income', category: '', amount: '', date: '', description: '' });
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const res = await API.get('/transactions');
    setTransactions(res.data);
    const income = res.data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = res.data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    setTotalIncome(income);
    setTotalExpense(expense);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/transactions', form);
      toast.success('Transaction added');
      fetchTransactions();
      setShowForm(false);
      setForm({ type: 'income', category: '', amount: '', date: '', description: '' });
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Accounting</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"><Plus size={18} /> Add Transaction</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded flex items-center"><TrendingUp className="text-green-600 mr-2" /><div><p className="text-sm">Total Income</p><p className="text-2xl font-bold">${totalIncome.toFixed(2)}</p></div></div>
        <div className="bg-red-100 p-4 rounded flex items-center"><TrendingDown className="text-red-600 mr-2" /><div><p className="text-sm">Total Expense</p><p className="text-2xl font-bold">${totalExpense.toFixed(2)}</p></div></div>
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>All</button>
        <button onClick={() => setFilter('income')} className={`px-3 py-1 rounded ${filter === 'income' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Income</button>
        <button onClick={() => setFilter('expense')} className={`px-3 py-1 rounded ${filter === 'expense' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Expense</button>
      </div>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full"><thead className="bg-gray-100"><tr><th>Date</th><th>Category</th><th>Type</th><th>Amount</th><th>Description</th></tr></thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t._id} className="border-t">
                <td className="px-4 py-2">{new Date(t.date).toLocaleDateString()}</td>
                <td>{t.category}</td>
                <td><span className={`px-2 py-1 text-xs rounded ${t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{t.type}</span></td>
                <td className={t.type === 'income' ? 'text-green-600' : 'text-red-600'}>${t.amount.toFixed(2)}</td>
                <td>{t.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"><div className="bg-white p-6 rounded w-96"><h2 className="text-xl mb-4">Add Transaction</h2><form onSubmit={handleSubmit} className="space-y-3"><select value={form.type} onChange={e => setForm({...form, type:e.target.value})} className="w-full p-2 border rounded"><option value="income">Income</option><option value="expense">Expense</option></select><input type="text" placeholder="Category" value={form.category} onChange={e => setForm({...form, category:e.target.value})} required className="w-full p-2 border rounded" /><input type="number" placeholder="Amount" value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} required className="w-full p-2 border rounded" /><input type="date" value={form.date} onChange={e => setForm({...form, date:e.target.value})} className="w-full p-2 border rounded" /><textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description:e.target.value})} className="w-full p-2 border rounded" /><div className="flex justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="px-3 py-1 border rounded">Cancel</button><button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button></div></form></div></div>
      )}
    </div>
  );
};

export default Transactions;