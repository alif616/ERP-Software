import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { DollarSign, CheckCircle } from 'lucide-react';

const Salary = () => {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedEmp, setSelectedEmp] = useState('');
  const [basic, setBasic] = useState('');
  const [allowances, setAllowances] = useState(0);
  const [deductions, setDeductions] = useState(0);

  useEffect(() => {
    fetchSalaries();
    fetchEmployees();
  }, [month, year]);

  const fetchSalaries = async () => {
    const res = await API.get(`/salaries?month=${month}&year=${year}`);
    setSalaries(res.data);
  };
  const fetchEmployees = async () => {
    const res = await API.get('/employees?limit=100');
    setEmployees(res.data.employees);
  };

  const generateSalary = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return toast.error('Select employee');
    const netSalary = parseFloat(basic) + parseFloat(allowances) - parseFloat(deductions);
    try {
      await API.post('/salaries', {
        employeeId: selectedEmp,
        month, year,
        basic: parseFloat(basic),
        allowances: parseFloat(allowances),
        deductions: parseFloat(deductions),
        netSalary
      });
      toast.success('Salary record created');
      fetchSalaries();
      setSelectedEmp(''); setBasic(''); setAllowances(0); setDeductions(0);
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  const markPaid = async (id) => {
    await API.put(`/salaries/${id}/pay`);
    toast.success('Marked as paid');
    fetchSalaries();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Salary Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">Generate Salary</h2>
          <form onSubmit={generateSalary} className="space-y-3">
            <div className="flex gap-2">
              <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="border p-2 rounded w-1/2"><option value={1}>Jan</option>... add all months</select>
              <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} className="border p-2 rounded w-1/2" />
            </div>
            <select value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)} required className="w-full border p-2 rounded">
              <option value="">Select Employee</option>
              {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} (${emp.salary})</option>)}
            </select>
            <input type="number" step="0.01" placeholder="Basic Salary" value={basic} onChange={e => setBasic(e.target.value)} required className="w-full border p-2 rounded" />
            <input type="number" step="0.01" placeholder="Allowances" value={allowances} onChange={e => setAllowances(e.target.value)} className="w-full border p-2 rounded" />
            <input type="number" step="0.01" placeholder="Deductions" value={deductions} onChange={e => setDeductions(e.target.value)} className="w-full border p-2 rounded" />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Salary Record</button>
          </form>
        </div>
        <div className="bg-white p-4 rounded shadow overflow-x-auto">
          <h2 className="text-xl font-semibold mb-3">Salary Records - {month}/{year}</h2>
          <table className="min-w-full">
            <thead><tr><th>Employee</th><th>Basic</th><th>Allowances</th><th>Deductions</th><th>Net</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {salaries.map(s => (
                <tr key={s._id} className="border-t">
                  <td>{s.employeeId?.name}</td><td>${s.basic}</td><td>${s.allowances}</td><td>${s.deductions}</td><td className="font-bold">${s.netSalary}</td>
                  <td><span className={`px-2 py-1 text-xs rounded ${s.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{s.status}</span></td>
                  <td>{s.status !== 'paid' && <button onClick={() => markPaid(s._id)}><CheckCircle size={18} className="text-green-600" /></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Salary;