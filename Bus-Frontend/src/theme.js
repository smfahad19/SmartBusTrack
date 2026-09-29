import { createTheme } from '@mui/material/styles';

export const FONT_FAMILY = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

export function buildTheme(mode) {
  const dark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? '#79a7ff' : '#2865e8', contrastText: dark ? '#0a0a0a' : '#ffffff' },
      secondary: { main: dark ? '#64d4b4' : '#168b73' },
      background: { default: dark ? '#0a0a0a' : '#f5f7fb', paper: dark ? '#141414' : '#ffffff' },
      text: { primary: dark ? '#ffffff' : '#182b49', secondary: dark ? '#a0a0b0' : '#718098' },
      divider: dark ? '#2b2b36' : '#e5eaf2',
    },
    typography: {
      fontFamily: FONT_FAMILY,
      h3: { fontWeight: 700, fontSize: 28 }, h4: { fontWeight: 700, fontSize: 26 }, h6: { fontWeight: 650, fontSize: 17 },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 10, boxShadow: 'none' } } },
      MuiCard: { styleOverrides: { root: { borderRadius: 18, backgroundImage: 'none', boxShadow: dark ? '0 4px 24px #0003' : '0 4px 24px #20375a09' } } },
      MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: dark ? '#191922' : '#fafbfd', fontSize: 14 }, notchedOutline: { borderColor: dark ? '#363644' : '#dfe5ee' } } },
      MuiInputLabel: { styleOverrides: { root: { fontSize: 14 } } },
      MuiTableRow: { styleOverrides: { root: { '&.MuiTableRow-hover:hover': { backgroundColor: dark ? '#1c2433' : '#f1f5fb' }, '&.MuiTableRow-hover:focus-within': { backgroundColor: dark ? '#1c2433' : '#f1f5fb' } } } },
      MuiTableCell: { styleOverrides: { head: { color: dark ? '#a0a0b0' : '#718098', fontSize: 11, fontWeight: 650 }, body: { fontSize: 13 } } },
    }
  });
}
