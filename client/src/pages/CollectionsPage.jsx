import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import { fetchCollections, createCollection, updateCollection, deleteCollection } from '../store/collectionsSlice';

export default function CollectionsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: collections, loading } = useSelector((state) => state.collections);
  const [openCreate, setOpenCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    dispatch(fetchCollections());
  }, [dispatch]);

  // Исключаем системную коллекцию «Избранное» из управления
  const userCollections = collections.filter(c => !c.is_favorites);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await dispatch(createCollection(newName.trim()));
    setNewName('');
    setOpenCreate(false);
  };

  const handleEditOpen = (col) => {
    setEditItem(col);
    setEditName(col.name);
  };

  const handleEditSave = async () => {
    if (!editName.trim()) return;
    await dispatch(updateCollection({ id: editItem.id, name: editName.trim() }));
    setEditItem(null);
  };

  const handleDelete = async (id) => {
    await dispatch(deleteCollection(id));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Мои коллекции</Typography>
        <Button variant="contained" onClick={() => setOpenCreate(true)}>
          Создать коллекцию
        </Button>
      </Box>

      {loading && <CircularProgress />}

      {!loading && userCollections.length === 0 && (
        <Typography color="text.secondary">Нет пользовательских коллекций</Typography>
      )}

      <List>
        {userCollections.map(col => (
          <ListItem
            key={col.id}
            secondaryAction={
              <>
                <IconButton edge="end" onClick={() => handleEditOpen(col)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(col.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
            button
            onClick={() => navigate(`/collections/${col.id}`)}
          >
            <FolderIcon sx={{ mr: 2 }} />
            <ListItemText primary={col.name} secondary={`Рецептов: ${col.recipe_count || 0}`} />
          </ListItem>
        ))}
      </List>

      {/* Диалог создания */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Новая коллекция</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Название"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Отмена</Button>
          <Button onClick={handleCreate} variant="contained">Создать</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог переименования */}
      <Dialog open={!!editItem} onClose={() => setEditItem(null)}>
        <DialogTitle>Переименовать коллекцию</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Название"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditItem(null)}>Отмена</Button>
          <Button onClick={handleEditSave} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}