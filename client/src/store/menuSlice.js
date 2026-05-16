import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../axios';

// Получить список всех ингредиентов для автокомплита
export const fetchAllIngredients = createAsyncThunk(
  'menu/fetchAllIngredients',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/ingredients');
      return data; // массив { id, name }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка загрузки ингредиентов');
    }
  }
);

// Генерация меню
export const generateMenu = createAsyncThunk(
  'menu/generateMenu',
  async (ingredients, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/menu/generate', { ingredients });
      return data; // массив { recipe, missing_ingredients }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка генерации меню');
    }
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    ingredientsList: [], // для автокомплита
    loadingIngredients: false,
    searchTerms: [],
    results: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearResults: (state) => {
      state.results = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllIngredients.pending, (state) => {
        state.loadingIngredients = true;
      })
      .addCase(fetchAllIngredients.fulfilled, (state, action) => {
        state.loadingIngredients = false;
        state.ingredientsList = action.payload;
      })
      .addCase(fetchAllIngredients.rejected, (state) => {
        state.loadingIngredients = false;
      })
      .addCase(generateMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.results = [];
      })
      .addCase(generateMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(generateMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearResults } = menuSlice.actions;
export default menuSlice.reducer;