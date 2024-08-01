import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import {
  AppBar,
  Box,
  Drawer,
  Divider,
  IconButton,
  Toolbar,
  Typography,
  CssBaseline,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Grid,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import InfoIcon from '@mui/icons-material/Info';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 240;

export const NavBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };
  const drawer = (
    <div    >
      <Toolbar
        sx={{ backgroundColor: 'primary.main', }}
      />
      <Divider />
      <List >
        <ListItem key='Info' disablePadding>
          <ListItemButton
            component={NavLink}
            to='/info'
          >
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary='Info' />
          </ListItemButton>
        </ListItem>
        <ListItem key='Pacientes' disablePadding>
          <ListItemButton
            component={NavLink}
            to='/pacientes'
          >
            <ListItemIcon>
              <PermContactCalendarIcon />
            </ListItemIcon>
            <ListItemText primary='Pacientes' />
          </ListItemButton>
        </ListItem>
        <ListItem key='Cliente' disablePadding>
          <ListItemButton
            component={NavLink}
            to='/clientes'
          >
            <ListItemIcon>
              <PermContactCalendarIcon />
            </ListItemIcon>
            <ListItemText primary='Clientes' />
          </ListItemButton>
        </ListItem>
        <ListItem key='Calendario' disablePadding>
          <ListItemButton
            component={NavLink}
            to='/calendar'
          >
            <ListItemIcon>
              <EditCalendarIcon />
            </ListItemIcon>
            <ListItemText primary='Calendario' />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <ListItem key='Logout' disablePadding
        sx={{
          color: 'error.main',
          display: { xs: 'block', sm: 'block', md: 'none', lg: 'none' }
        }}
        component={NavLink} to="/login"      >
        <ListItemButton        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary='Logout' />
        </ListItemButton>
      </ListItem>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position='fixed'
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color='inherit'
            aria-label='open drawer'
            edge='start'
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Grid container direction='row' justifyContent='space-between' alignItems='center'>
            <Typography variant='h4' noWrap >
              Optica Echeverria
            </Typography>
            <Box
              sx={{
                display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', bg: 'flex' }
              }}
            >
              <Typography variant='h6' noWrap sx={{ marginRight: 3 }} >
                Lesly
              </Typography>
              <Button
                variant='contained'
                color='error'
                component={NavLink} 
                to="/login"
                endIcon={<LogoutIcon />} >
                Logout
              </Button>
            </Box>
          </Grid>
        </Toolbar>
      </AppBar>
      <Box
        component='nav'
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label='mailbox folders'
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          variant='temporary'
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant='permanent'
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component='main'
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
      </Box>
    </Box>
  );
}
