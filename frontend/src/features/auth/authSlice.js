import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const login = createAsyncThunk('auth/login', async ({ email, password }) => {
  const { data } = await API.post('/auth/login', { email, password });
  localStorage.setItem('userInfo', JSON.stringify(data));
  return data;
});

export const logout = () => {
  localStorage.removeItem('userInfo');
  return { type: 'auth/logout' };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: { userInfo: JSON.parse(localStorage.getItem('userInfo')) || null, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => { state.loading = true; });
    builder.addCase(login.fulfilled, (state, action) => { state.loading = false; state.userInfo = action.payload; });
    builder.addCase(login.rejected, (state) => { state.loading = false; });
  },
});

export default authSlice.reducer;