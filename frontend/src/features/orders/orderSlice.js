import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchOrders = createAsyncThunk('orders/fetch', async ({ page, search }) => {
  const { data } = await API.get('/orders', { params: { page, search } });
  return data;
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status }) => {
  const { data } = await API.put(`/orders/${id}/status`, { status });
  return data;
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { orders: [], totalPages: 1, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchOrders.rejected, (state) => { state.loading = false; });
  },
});

export default orderSlice.reducer;