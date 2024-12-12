import { createTheme } from '@mui/material';

export const BlueTheme = createTheme({
    palette: {
        primary: {
            main: '#002946'
        },
        secondary: {
            main: '#1f80c6'
        },
        error: {
            main: '#cc0404'
        },
        success: {
            main: '#4c8e00'
        }
    }, 
    drawer: {
        width: 240,
    },
    fonts: {
        body: 'system-ui, sans-serif',
        heading: '"Avenir Next", sans-serif',
        monospace: 'Menlo, monospace',
      },
      colors: {
        text: '#000',
        background: '#fff',
        primary: '#33e',
      },
})