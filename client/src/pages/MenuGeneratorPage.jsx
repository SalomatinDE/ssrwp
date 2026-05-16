import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Chip,
  Rating,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { fetchAllIngredients, generateMenu, clearResults } from '../store/menuSlice';

export default function MenuGeneratorPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ingredientsList, loadingIngredients, results, loading, error } = useSelector(
    (state) => state.menu
  );
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  useEffect(() => {
    dispatch(fetchAllIngredients());
  }, [dispatch]);

  const handleGenerate = () => {
    if (selectedIngredients.length === 0) return;
    dispatch(generateMenu(selectedIngredients));
  };

  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        Генератор меню
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Введите ингредиенты, которые у вас есть, и мы подберём рецепты.
      </Typography>

      <Box display="flex" gap={2} alignItems="flex-start" mb={4}>
        <Autocomplete
          multiple
          freeSolo
          options={ingredientsList.map((ing) => ing.name)}
          value={selectedIngredients}
          onChange={(_, newValue) => setSelectedIngredients(newValue)}
          loading={loadingIngredients}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Ингредиенты"
              placeholder="Начните вводить..."
            />
          )}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={selectedIngredients.length === 0 || loading}
          sx={{ height: 56 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Сгенерировать'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box textAlign="center" py={4}>
          <CircularProgress />
          <Typography mt={2}>Ищем рецепты...</Typography>
        </Box>
      )}

      {!loading && results.length > 0 && (
        <Box display="flex" flexDirection="column" gap={2}>
          {results.map((item, index) => {
            const recipe = item.recipe;
            const missing = item.missing_ingredients || [];
            const canCook = missing.length === 0;

            return (
              <Card
                key={index}
                sx={{ cursor: 'pointer', transition: '0.2s', '&:hover': { boxShadow: 4 } }}
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{recipe.title}</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Rating value={recipe.rating_average} precision={0.5} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        {recipe.cooking_time} мин
                      </Typography>
                    </Box>
                  </Box>

                  <Box mt={1}>
                    {canCook ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Можно приготовить"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<WarningAmberIcon />}
                        label={`Не хватает: ${missing.length}`}
                        color="warning"
                        size="small"
                      />
                    )}
                  </Box>

                  {missing.length > 0 && (
                    <Box mt={1}>
                      <Typography variant="body2" color="warning.dark">
                        Недостающие ингредиенты:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                        {missing.map((name) => (
                          <Chip key={name} label={name} size="small" variant="outlined" color="warning" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {!loading && !error && results.length === 0 && (
        <Typography textAlign="center" color="text.secondary">
          Введите ингредиенты и нажмите "Сгенерировать"
        </Typography>
      )}
    </Box>
  );
}