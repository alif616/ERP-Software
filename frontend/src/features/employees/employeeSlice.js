import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchEmployees = createAsyncThunk('employees/fetch', async ({ page, search }) => {
  const { data } = await API.get('/employees', { params: { page, search } });
  return data;
});

export const createEmployee = createAsyncThunk('employees/create', async (employeeData) => {
  const { data } = await API.post('/employees', employeeData);
  return data;
});

export const updateEmployee = createAsyncThunk('employees/update', async ({ id, employeeData }) => {
  const { data } = await API.put(`/employees/${id}`, employeeData);
  return data;
});

export const deleteEmployee = createAsyncThunk('employees/delete', async (id) => {
  await API.delete(`/employees/${id}`);
  return id;
});

const employeeSlice = createSlice({
  name: 'employees',
  initialState: { employees: [], totalPages: 1, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => { state.loading = true; })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.employees;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchEmployees.rejected, (state) => { state.loading = false; });
  },
});

export default employeeSlice.reducer;