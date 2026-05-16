import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B35', // оранжевый, кулинарная тема
      light: '#FF8C5A',
      dark: '#E04E1E'
    },
    secondary: {
      main: '#2E4057', // тёмно-синий
    },
    background: {
      default: '#FFF8F0'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.5rem', fontWeight: 500 }
  },
  shape: {
    borderRadius: 12
  }
});

export default theme;