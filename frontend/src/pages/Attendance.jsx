import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

const Attendance = () => {
  const { userInfo } = useSelector(state => state.auth);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const isAdminOrManager = ['admin', 'manager'].includes(userInfo?.role);

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, [selectedDate]);

  const fetchEmployees = async () => {
    const res = await API.get('/employees?limit=100');
    setEmployees(res.data.employees);
  };

  const fetchAttendance = async () => {
    const res = await API.get(`/attendance?date=${selectedDate}`);
    const attMap = {};
    res.data.forEach(a => { attMap[a.employeeId] = a.status; });
    setAttendance(attMap);
  };

  const handleStatusChange = async (employeeId, status) => {
    if (!isAdminOrManager) return;
    try {
      await API.post('/attendance', { employeeId, date: selectedDate, status });
      toast.success('Attendance updated');
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const markSelf = async (type) => {
    // For employees to mark their own attendance (check-in/out)
    try {
      await API.post('/attendance/self', { type, date: selectedDate });
      toast.success(`${type} recorded`);
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <div className="flex gap-2">
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border p-2 rounded" />
          {userInfo?.role === 'employee' && (
            <button onClick={() => markSelf('checkin')} className="bg-green-600 text-white px-3 py-1 rounded">Check In</button>
          )}
          {userInfo?.role === 'employee' && (
            <button onClick={() => markSelf('checkout')} className="bg-red-600 text-white px-3 py-1 rounded">Check Out</button>
          )}
        </div>
      </div>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100"><tr><th>Employee</th><th>Department</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {employees.map(emp => {
              const currentStatus = attendance[emp._id] || 'absent';
              return (
                <tr key={emp._id} className="border-t">
                  <td className="px-4 py-2">{emp.name}</td>
                  <td className="px-4 py-2">{emp.department || '-'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${currentStatus === 'present' ? 'bg-green-100 text-green-800' : currentStatus === 'half-day' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {currentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {isAdminOrManager && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatusChange(emp._id, 'present')} className="text-green-600"><CheckCircle size={18} /></button>
                        <button onClick={() => handleStatusChange(emp._id, 'absent')} className="text-red-600"><XCircle size={18} /></button>
                        <button onClick={() => handleStatusChange(emp._id, 'half-day')} className="text-yellow-600"><Calendar size={18} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;