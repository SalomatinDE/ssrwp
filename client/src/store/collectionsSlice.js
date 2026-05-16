import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../axios';

// Получить все коллекции пользователя (включая избранное)
export const fetchCollections = createAsyncThunk(
  'collections/fetchCollections',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/collections');
      return data; // массив коллекций { id, name, is_favorites, created_at }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка загрузки коллекций');
    }
  }
);

// Создать коллекцию
export const createCollection = createAsyncThunk(
  'collections/createCollection',
  async (name, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/collections', { name });
      return data; // созданная коллекция
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка создания коллекции');
    }
  }
);

// Переименовать коллекцию
export const updateCollection = createAsyncThunk(
  'collections/updateCollection',
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/collections/${id}`, { name });
      return data; // обновлённая коллекция
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка переименования');
    }
  }
);

// Удалить коллекцию
export const deleteCollection = createAsyncThunk(
  'collections/deleteCollection',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/collections/${id}`);
      return id; // возвращаем id удалённой
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка удаления');
    }
  }
);

// Получить рецепты коллекции
export const fetchCollectionRecipes = createAsyncThunk(
  'collections/fetchCollectionRecipes',
  async ({ collectionId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/collections/${collectionId}/recipes`, { params: { page, limit } });
      return data; // { total, page, limit, collection_id, collection_name, recipes }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка загрузки рецептов коллекции');
    }
  }
);

// Добавить рецепт в коллекцию
export const addToCollection = createAsyncThunk(
  'collections/addToCollection',
  async ({ collectionId, recipeId }, { rejectWithValue }) => {
    try {
      await api.post(`/collections/${collectionId}/recipes`, { recipe_id: recipeId });
      return { collectionId, recipeId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка добавления в коллекцию');
    }
  }
);

// Удалить рецепт из коллекции
export const removeFromCollection = createAsyncThunk(
  'collections/removeFromCollection',
  async ({ collectionId, recipeId }, { rejectWithValue }) => {
    try {
      await api.delete(`/collections/${collectionId}/recipes/${recipeId}`);
      return { collectionId, recipeId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка удаления из коллекции');
    }
  }
);

const collectionsSlice = createSlice({
  name: 'collections',
  initialState: {
    list: [],              // все коллекции пользователя
    loading: false,
    error: null,
    currentCollection: null, // данные загруженной коллекции (рецепты)
    collectionRecipes: [],
    collectionTotal: 0,
    collectionPage: 1,
    collectionLimit: 10,
    collectionLoading: false,
  },
  reducers: {
    clearCurrentCollection(state) {
      state.currentCollection = null;
      state.collectionRecipes = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCollections.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchCollections.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createCollection.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(updateCollection.fulfilled, (state, action) => {
        const index = state.list.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.list = state.list.filter(c => c.id !== action.payload);
      })
      .addCase(fetchCollectionRecipes.pending, (state) => { state.collectionLoading = true; })
      .addCase(fetchCollectionRecipes.fulfilled, (state, action) => {
        state.collectionLoading = false;
        state.collectionRecipes = action.payload.recipes;
        state.collectionTotal = action.payload.total;
        state.collectionPage = action.payload.page;
        state.currentCollection = { id: action.payload.collection_id, name: action.payload.collection_name };
      })
      .addCase(fetchCollectionRecipes.rejected, (state) => { state.collectionLoading = false; })
      // Для addToCollection/removeFromCollection можно не менять state.list,
      // но при необходимости обновим конкретную коллекцию (если загружена)
      .addCase(addToCollection.fulfilled, () => {})
      .addCase(removeFromCollection.fulfilled, (state, action) => {
        if (state.currentCollection?.id === action.payload.collectionId) {
          state.collectionRecipes = state.collectionRecipes.filter(r => r.id !== action.payload.recipeId);
        }
      });
  }
});

export const { clearCurrentCollection } = collectionsSlice.actions;
export default collectionsSlice.reducer;