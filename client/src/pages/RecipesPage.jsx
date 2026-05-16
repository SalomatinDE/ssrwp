import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Rating,
  Pagination,
  TextField,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  CardActions,
} from '@mui/material';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import { fetchRecipes, setSearch } from '../store/recipesSlice';
import AddToCollectionDialog from '../components/AddToCollectionDialog';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function RecipesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 500);

  const { list, total, page, limit, loadingList, errorList } = useSelector(
    (state) => state.recipes
  );

  // Состояние для диалога добавления в коллекцию
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  useEffect(() => {
    dispatch(setSearch(debouncedSearch));
    if (debouncedSearch) {
      setSearchParams({ search: debouncedSearch });
    } else {
      setSearchParams({});
    }
  }, [debouncedSearch, dispatch, setSearchParams]);

  useEffect(() => {
    dispatch(fetchRecipes({ page, limit, search: debouncedSearch }));
  }, [dispatch, page, limit, debouncedSearch]);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handlePageChange = (_, newPage) => {
    dispatch(fetchRecipes({ page: newPage, limit, search: debouncedSearch }));
  };

  const handleOpenCollectionDialog = (e, recipeId) => {
    e.stopPropagation(); // предотвращаем переход к деталям рецепта
    setSelectedRecipeId(recipeId);
    setDialogOpen(true);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        Рецепты
      </Typography>

      <TextField
        fullWidth
        label="Поиск по названию или ингредиенту"
        value={searchInput}
        onChange={handleSearchChange}
        sx={{ mb: 4 }}
      />

      {errorList && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorList}
        </Alert>
      )}

      {loadingList ? (
        <Box textAlign="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {list.length === 0 ? (
            <Typography variant="h6" textAlign="center" color="text.secondary">
              Рецептов не найдено
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {list.map((recipe) => (
                <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={recipe.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}
                      alt={recipe.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {recipe.title}
                      </Typography>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          {recipe.cooking_time} мин.
                        </Typography>
                        <Rating
                          value={parseFloat(recipe.rating_average) || 0}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                      </Box>
                      {recipe.author && (
                        <Typography variant="body2" color="text.secondary">
                          Автор: {recipe.author.username}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions disableSpacing>
                      <IconButton
                        onClick={(e) => handleOpenCollectionDialog(e, recipe.id)}
                        title="Добавить в коллекцию"
                      >
                        <BookmarkAddIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Диалог добавления в коллекцию */}
      <AddToCollectionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        recipeId={selectedRecipeId}
      />
    </Box>
  );
}