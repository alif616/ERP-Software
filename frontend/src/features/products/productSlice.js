import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchProducts = createAsyncThunk('products/fetch', async ({ page, search }) => {
  const { data } = await API.get('/products', { params: { page, search } });
  return data;
});

export const createProduct = createAsyncThunk('products/create', async (productData) => {
  const { data } = await API.post('/products', productData);
  return data;
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, productData }) => {
  const { data } = await API.put(`/products/${id}`, productData);
  return data;
});

export const deleteProduct = createAsyncThunk('products/delete', async (id) => {
  await API.delete(`/products/${id}`);
  return id;
});

export const uploadProductImage = createAsyncThunk('products/uploadImage', async ({ id, imageData }) => {
  const { data } = await API.put(`/products/${id}/image`, imageData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return { id, imageUrl: data.imageUrl };
});

const productSlice = createSlice({
  name: 'products',
  initialState: { products: [], totalPages: 1, loading: false },
  reducers: {
    setLowStockAlert: (state, action) => {
      // Optional: manage local alerts
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchProducts.rejected, (state) => { state.loading = false; });
  },
});

export const { setLowStockAlert } = productSlice.actions;
export default productSlice.reducer;