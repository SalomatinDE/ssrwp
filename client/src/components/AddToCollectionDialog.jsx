import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCollections, addToCollection, removeFromCollection } from '../store/collectionsSlice';

export default function AddToCollectionDialog({ open, onClose, recipeId }) {
  const dispatch = useDispatch();
  const { list: collections, loading } = useSelector((state) => state.collections);
  const { user } = useSelector((state) => state.auth);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    if (open && user) {
      dispatch(fetchCollections());
    }
  }, [open, dispatch, user]);

  const handleToggle = (collectionId) => {
    setSelected(prev => ({ ...prev, [collectionId]: !prev[collectionId] }));
  };

  const handleSave = async () => {
    for (const collectionId in selected) {
      if (selected[collectionId]) {
        await dispatch(addToCollection({ collectionId: Number(collectionId), recipeId })).unwrap();
      } else {
        // если сняли выделение — удаляем (если рецепт там был)
        await dispatch(removeFromCollection({ collectionId: Number(collectionId), recipeId })).unwrap();
      }
    }
    onClose();
  };

  // Фильтруем коллекции: исключаем системную "Избранное" (is_favorites=true)
  const userCollections = collections.filter(c => !c.is_favorites);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Добавить в коллекцию</DialogTitle>
      <DialogContent>
        {userCollections.length === 0 && !loading && (
          <div>Нет пользовательских коллекций. Создайте их в разделе "Мои коллекции".</div>
        )}
        <List>
          {userCollections.map(col => (
            <ListItem key={col.id} dense button onClick={() => handleToggle(col.id)}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={!!selected[col.id]}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText primary={col.name} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSave} variant="contained">Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
}