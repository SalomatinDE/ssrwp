import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../axios';

// Получить список рецептов
export const fetchRecipes = createAsyncThunk(
  'recipes/fetchRecipes',
  async ({ page = 1, limit = 10, search = '' }, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/recipes', { params: { page, limit, search } });
      return data; // { total, page, limit, recipes }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка загрузки рецептов');
    }
  }
);

// Получить один рецепт (с проверкой избранного и оценки пользователя)
export const fetchRecipeById = createAsyncThunk(
  'recipes/fetchRecipeById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/recipes/${id}`);
      const recipe = data;
      const token = getState().auth.token;
      if (token) {
        try {
          // Проверим, находится ли рецепт в избранном
          const favsResponse = await api.get('/favorites');
          const favorites = favsResponse.data.favorites || [];
          recipe.isFavorited = favorites.some(fav => fav.id === recipe.id);
        } catch  { /* игнорируем, если не удалось */ }
      }
      return recipe;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка загрузки рецепта');
    }
  }
);

// Добавить в избранное
export const addToFavorites = createAsyncThunk(
  'recipes/addToFavorites',
  async (recipeId, { rejectWithValue }) => {
    try {
      await api.post(`/favorites/${recipeId}`);
      return recipeId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Не удалось добавить в избранное');
    }
  }
);

// Удалить из избранного
export const removeFromFavorites = createAsyncThunk(
  'recipes/removeFromFavorites',
  async (recipeId, { rejectWithValue }) => {
    try {
      await api.delete(`/favorites/${recipeId}`);
      return recipeId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Не удалось удалить из избранного');
    }
  }
);

// Поставить или обновить оценку
export const rateRecipe = createAsyncThunk(
  'recipes/rateRecipe',
  async ({ recipeId, score }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/recipes/${recipeId}/rate`, { score });
      return { recipeId, average_rating: data.average_rating, user_score: score };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка оценки');
    }
  }
);

const recipesSlice = createSlice({
  name: 'recipes',
  initialState: {
    list: [],
    total: 0,
    page: 1,
    limit: 10,
    search: '',
    loadingList: false,
    errorList: null,
    currentRecipe: null,
    loadingDetail: false,
    errorDetail: null,
    ratingLoading: false,
  },
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
      state.page = 1;
    },
    clearCurrentRecipe(state) {
      state.currentRecipe = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Список рецептов
      .addCase(fetchRecipes.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.loadingList = false;
        state.list = action.payload.recipes;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      })

      // Детальный рецепт
      .addCase(fetchRecipeById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentRecipe = action.payload;
      })
      .addCase(fetchRecipeById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload;
      })

      // Избранное
      .addCase(addToFavorites.fulfilled, (state, action) => {
        if (state.currentRecipe && state.currentRecipe.id === action.payload) {
          state.currentRecipe.isFavorited = true;
        }
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        if (state.currentRecipe && state.currentRecipe.id === action.payload) {
          state.currentRecipe.isFavorited = false;
        }
      })

      // Оценка
      .addCase(rateRecipe.pending, (state) => {
        state.ratingLoading = true;
      })
      .addCase(rateRecipe.fulfilled, (state, action) => {
        state.ratingLoading = false;
        if (state.currentRecipe && state.currentRecipe.id === action.payload.recipeId) {
          state.currentRecipe.rating_average = action.payload.average_rating;
          state.currentRecipe.userRating = action.payload.user_score;
        }
      })
      .addCase(rateRecipe.rejected, (state) => {
        state.ratingLoading = false;
      });
  },
});

export const { setSearch, clearCurrentRecipe } = recipesSlice.actions;
export default recipesSlice.reducer;