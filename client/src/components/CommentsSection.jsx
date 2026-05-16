import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  fetchComments,
  addComment,
  updateComment,
  deleteComment,
  clearComments,
} from '../store/commentsSlice';

export default function CommentsSection({ recipeId }) {
  const dispatch = useDispatch();
  const { items, loading, error, adding, hasMore, page } = useSelector(
    (state) => state.comments
  );
  const { user, token } = useSelector((state) => state.auth);

  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuCommentId, setMenuCommentId] = useState(null);

  useEffect(() => {
    dispatch(fetchComments({ recipeId }));
    return () => {
      dispatch(clearComments());
    };
  }, [dispatch, recipeId]);

  const handleLoadMore = () => {
    dispatch(fetchComments({ recipeId, page: page + 1 }));
  };

  const handleAdd = async () => {
    if (!newText.trim()) return;
    await dispatch(addComment({ recipeId, text: newText.trim() }));
    setNewText('');
  };

  const handleMenuOpen = (event, commentId) => {
    setAnchorEl(event.currentTarget);
    setMenuCommentId(commentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCommentId(null);
  };

  const handleEditStart = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
    handleMenuClose();
  };

  const handleEditSave = async (commentId) => {
    if (!editText.trim()) return;
    await dispatch(updateComment({ commentId, text: editText.trim() }));
    setEditingId(null);
    setEditText('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = async (commentId) => {
    await dispatch(deleteComment({ commentId, recipeId }));
    handleMenuClose();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('ru-RU');
  };

  return (
    <Box mt={4}>
      <Typography variant="h5" gutterBottom>
        Комментарии ({items.length}{hasMore ? '+' : ''})
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Форма добавления (только для авторизованных) */}
      {token && user && (
        <Box display="flex" gap={2} mb={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Напишите комментарий..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={adding || !newText.trim()}
          >
            {adding ? <CircularProgress size={24} /> : 'Отправить'}
          </Button>
        </Box>
      )}

      {/* Список комментариев */}
      {loading && items.length === 0 && (
        <Box textAlign="center" py={2}>
          <CircularProgress />
        </Box>
      )}

      {!loading && items.length === 0 && (
        <Typography color="text.secondary">Пока нет комментариев.</Typography>
      )}

      {items.map((comment) => (
        <Box key={comment.id} display="flex" mb={2} gap={2}>
          <Avatar
            src={comment.user?.avatar_url}
            alt={comment.user?.username}
          >
            {comment.user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box flexGrow={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle2">
                {comment.user?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.created_at)}
              </Typography>
            </Box>

            {editingId === comment.id ? (
              <Box display="flex" gap={1} mt={0.5}>
                <TextField
                  size="small"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  fullWidth
                />
                <Button size="small" onClick={() => handleEditSave(comment.id)}>Сохранить</Button>
                <Button size="small" onClick={handleEditCancel}>Отмена</Button>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                {comment.text}
              </Typography>
            )}
          </Box>

          {/* Меню действий для своего комментария */}
          {token && user && comment.user?.id === user.id && (
            <Box>
              <IconButton size="small" onClick={(e) => handleMenuOpen(e, comment.id)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      ))}

      {/* Кнопка «Показать ещё» */}
      {hasMore && !loading && (
        <Box textAlign="center" mt={2}>
          <Button variant="outlined" onClick={handleLoadMore}>
            Показать ещё
          </Button>
        </Box>
      )}

      {/* Меню действий */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const comment = items.find(c => c.id === menuCommentId);
          if (comment) handleEditStart(comment);
        }}>
          Редактировать
        </MenuItem>
        <MenuItem onClick={() => handleDelete(menuCommentId)}>
          Удалить
        </MenuItem>
      </Menu>
    </Box>
  );
}