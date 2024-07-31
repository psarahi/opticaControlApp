import { createTheme } from '@mui/material';
import { red } from '@mui/material/colors';

export const BlueTheme = createTheme({
    palette: {
        primary: {
            main: '#002946'
        },
        secondary: {
            main: '#1f80c6'
        },
        error: {
            main: red.A400
        }
    }
})