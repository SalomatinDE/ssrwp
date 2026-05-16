import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Pagination,
  CircularProgress,
  Rating,
} from '@mui/material';
import { fetchCollectionRecipes, clearCurrentCollection } from '../store/collectionsSlice';

export default function CollectionRecipesPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    collectionRecipes,
    collectionTotal,
    collectionPage,
    collectionLimit,
    collectionLoading,
    currentCollection,
  } = useSelector((state) => state.collections);

  useEffect(() => {
    dispatch(fetchCollectionRecipes({ collectionId: id, page: 1 }));
    return () => { dispatch(clearCurrentCollection()); };
  }, [dispatch, id]);

  const handlePageChange = (_, newPage) => {
    dispatch(fetchCollectionRecipes({ collectionId: id, page: newPage }));
  };

  const totalPages = Math.ceil(collectionTotal / collectionLimit);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {currentCollection?.name || 'Коллекция'}
      </Typography>

      {collectionLoading && <CircularProgress />}

      {!collectionLoading && collectionRecipes.length === 0 && (
        <Typography>В этой коллекции пока нет рецептов</Typography>
      )}

      <Grid container spacing={3}>
        {collectionRecipes.map(recipe => (
          <Grid item xs={12} sm={6} md={4} key={recipe.id}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => navigate(`/recipes/${recipe.id}`)}>
              <CardMedia
                component="img"
                height="140"
                image={recipe.image_url || 'https://via.placeholder.com/400x140'}
                alt={recipe.title}
              />
              <CardContent>
                <Typography variant="h6">{recipe.title}</Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Rating value={recipe.rating_average || 0} precision={0.5} readOnly size="small" />
                  <Typography variant="body2">{recipe.cooking_time} мин</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Box mt={3} display="flex" justifyContent="center">
          <Pagination count={totalPages} page={collectionPage} onChange={handlePageChange} />
        </Box>
      )}
    </Box>
  );
}