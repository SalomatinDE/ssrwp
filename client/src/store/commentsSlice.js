import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../axios';

// Загрузка комментариев (с пагинацией, но будем подгружать следующую страницу)
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async ({ recipeId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/recipes/${recipeId}/comments`, {
        params: { page, limit }
      });
      return { recipeId, ...data }; // { comments, total, page, limit }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка загрузки комментариев');
    }
  }
);

export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ recipeId, text }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/recipes/${recipeId}/comments`, { text });
      return { recipeId, comment: data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка добавления комментария');
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ commentId, text }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/comments/${commentId}`, { text });
      return data; // обновлённый комментарий
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка редактирования');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async ({ commentId, recipeId }, { rejectWithValue }) => {
    try {
      await api.delete(`/comments/${commentId}`);
      return { commentId, recipeId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка удаления');
    }
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    items: [],
    total: 0,
    page: 1,
    hasMore: false,
    loading: false,
    error: null,
    adding: false,
    editingId: null,
  },
  reducers: {
    clearComments(state) {
      state.items = [];
      state.total = 0;
      state.page = 1;
      state.hasMore = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchComments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        // Если загрузили первую страницу — заменяем, иначе добавляем
        if (action.payload.page === 1) {
          state.items = action.payload.comments;
        } else {
          state.items = [...state.items, ...action.payload.comments];
        }
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.hasMore = state.items.length < state.total;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addComment
      .addCase(addComment.pending, (state) => { state.adding = true; })
      .addCase(addComment.fulfilled, (state, action) => {
        state.adding = false;
        state.items.unshift(action.payload.comment);
        state.total += 1;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.adding = false;
        state.error = action.payload;
      })

      // updateComment
      .addCase(updateComment.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.items.findIndex(c => c.id === updated.id);
        if (index !== -1) state.items[index] = updated;
        state.editingId = null;
      })

      // deleteComment
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload.commentId);
        state.total = Math.max(0, state.total - 1);
      });
  }
});

export const { clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;