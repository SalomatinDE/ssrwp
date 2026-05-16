import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../axios';
import {
  Box,
  Typography,
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  Checkbox,
  ListItemText,
  IconButton,
  Rating,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import {
  fetchRecipeById,
  rateRecipe,
  clearCurrentRecipe,
} from '../store/recipesSlice';
import {
  fetchCollections,
  addToCollection,
  removeFromCollection,
} from '../store/collectionsSlice';
import AddToCollectionDialog from '../components/AddToCollectionDialog';
import KitchenTimer from '../components/KitchenTimer';
import CommentsSection from '../components/CommentsSection';
import { addTimer } from '../store/timersSlice';
import TimerIcon from '@mui/icons-material/Timer';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentRecipe, loadingDetail, errorDetail, ratingLoading } = useSelector(
    (state) => state.recipes
  );
  const { user, token } = useSelector((state) => state.auth);
  const { list: collections } = useSelector((state) => state.collections);

  const [isFavorited, setIsFavorited] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [favCollectionId, setFavCollectionId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(false);

  // Загрузка рецепта
  useEffect(() => {
    dispatch(fetchRecipeById(id));
    return () => {
      dispatch(clearCurrentRecipe());
    };
  }, [dispatch, id]);

  // Отправка просмотра
  useEffect(() => {
    if (token && id) {
      api.post(`/recipes/${id}/view`).catch(() => {});
    }
  }, [id, token]);

  // Загрузка коллекций пользователя
  useEffect(() => {
    if (token) {
      dispatch(fetchCollections());
    }
  }, [dispatch, token]);

  // Определяем ID избранной коллекции
  useEffect(() => {
    if (collections.length > 0) {
      const fav = collections.find((c) => c.is_favorites);
      if (fav) {
        setFavCollectionId(fav.id);
      }
    }
  }, [collections]);

  // Проверяем, есть ли рецепт в избранном (по коллекции "Избранное")
  useEffect(() => {
    if (!token || !favCollectionId || !currentRecipe) return;
    setCheckingFavorite(true);
    // Запрашиваем рецепты избранной коллекции (лимит большой, чтобы проверить наличие)
    api
      .get(`/collections/${favCollectionId}/recipes`, { params: { limit: 100 } })
      .then((res) => {
        const found = res.data.recipes.some((r) => r.id === currentRecipe.id);
        setIsFavorited(found);
      })
      .catch(() => {})
      .finally(() => setCheckingFavorite(false));
  }, [token, favCollectionId, currentRecipe]);

  // Синхронизация пользовательской оценки
  useEffect(() => {
    if (currentRecipe) {
      setUserRating(currentRecipe.userRating || 0);
    }
  }, [currentRecipe]);

  // Переключение избранного (теперь через коллекцию)
  const handleFavoriteToggle = async () => {
    if (!token) {
      alert('Войдите, чтобы добавить в избранное');
      return;
    }
    if (!favCollectionId) return;
    try {
      if (isFavorited) {
        await dispatch(removeFromCollection({ collectionId: favCollectionId, recipeId: currentRecipe.id })).unwrap();
        setIsFavorited(false);
      } else {
        await dispatch(addToCollection({ collectionId: favCollectionId, recipeId: currentRecipe.id })).unwrap();
        setIsFavorited(true);
      }
    } catch (err) {
      // ошибка уже обработана
    }
  };

  // Оценка рецепта
  const handleRate = async (_, newValue) => {
    if (!token || !newValue) return;
    try {
      await dispatch(rateRecipe({ recipeId: currentRecipe.id, score: newValue })).unwrap();
      setUserRating(newValue);
    } catch (err) { /* игнорируем */ }
  };

  if (loadingDetail) {
    return (
      <Box textAlign="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorDetail) {
    return <Alert severity="error">{errorDetail}</Alert>;
  }

  if (!currentRecipe) {
    return <Typography>Рецепт не найден</Typography>;
  }

  const {
    title,
    description,
    cooking_time,
    difficulty,
    image_url,
    ingredients = [],
    steps = [],
    rating_average,
    author,
  } = currentRecipe;

  const sortedSteps = [...steps].sort((a, b) => a.step_number - b.step_number);

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      {/* Заголовок и кнопки */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={2}>
        <Typography variant="h4">{title}</Typography>
        <Box>
          {token && (
            <>
              <IconButton onClick={handleFavoriteToggle} color="error" disabled={checkingFavorite}>
                {isFavorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <IconButton onClick={() => setDialogOpen(true)} title="Добавить в коллекцию">
                <BookmarkAddIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Box>

      {/* Автор */}
      {author && (
        <Typography variant="subtitle1" color="text.secondary" mb={2}>
          Автор: {author.username}
        </Typography>
      )}

      {/* Изображение */}
      {image_url && (
        <CardMedia
          component="img"
          height="400"
          image={image_url}
          alt={title}
          sx={{ borderRadius: 2, mb: 3 }}
        />
      )}

      {/* Характеристики */}
      <Box display="flex" gap={2} mb={3}>
        <Chip label={`Время: ${cooking_time} мин`} variant="outlined" color="primary" />
        <Chip label={`Сложность: ${difficulty}`} variant="outlined" color="secondary" />
      </Box>

      {/* Описание */}
      <Typography variant="body1" paragraph>
        {description}
      </Typography>

      {/* Ингредиенты */}
      <Typography variant="h5" gutterBottom mt={4}>
        Ингредиенты
      </Typography>
      <List>
        {ingredients.map((ing, index) => (
          <ListItem key={index} disablePadding>
            <ListItemIcon>
              <Checkbox edge="start" tabIndex={-1} disableRipple />
            </ListItemIcon>
            <ListItemText
              primary={`${ing.name} — ${ing.RecipeIngredient?.quantity ?? ing.quantity ?? ''} ${ing.RecipeIngredient?.unit ?? ing.unit ?? ''}`}
            />
          </ListItem>
        ))}
      </List>

      {/* Шаги */}
      <Typography variant="h5" gutterBottom mt={4}>
        Шаги приготовления
      </Typography>
      <Box component="ol" sx={{ pl: 2 }}>
        {sortedSteps.map((step) => (
          <Box component="li" key={step.step_number} sx={{ mb: 2 }}>
            <Typography variant="body1">{step.instruction}</Typography>
            {step.duration && (
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Chip size="small" label={`${step.duration} мин`} />
                <Button
                size="small"
                variant="outlined"
                startIcon={<TimerIcon />}
                onClick={() => dispatch(addTimer({ label: step.instruction, duration: step.duration * 60 }))}
                >
                  Запустить таймер
                  </Button>
                  </Box>
                )}
                </Box>
              ))}
      </Box>

      {/* Рейтинг */}
      <Box mt={4} display="flex" alignItems="center" gap={2}>
        <Typography variant="h6">Рейтинг:</Typography>
        <Rating value={parseFloat(rating_average) || 0} precision={0.5} readOnly />
        <Typography variant="body2" color="text.secondary">
          ({rating_average ? Number(rating_average).toFixed(1) : '0.0'})
        </Typography>
      </Box>

      {/* Своя оценка (только для авторизованных) */}
      {token && (
        <Box mt={2}>
          <Typography variant="body1">Ваша оценка:</Typography>
          <Rating
            value={userRating}
            onChange={handleRate}
            precision={1}
            size="large"
            disabled={ratingLoading}
          />
        </Box>
      )}

      <CommentsSection recipeId={currentRecipe.id} />

      {/* Диалог добавления в коллекцию */}
      <AddToCollectionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        recipeId={currentRecipe.id}
      />
    </Paper>
  );
}