import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import {
  AppBar, Box, Drawer, Divider, IconButton, Toolbar, Typography,
  CssBaseline, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Button, Grid, Collapse
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import FolderIcon from '@mui/icons-material/Folder';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import NumbersIcon from '@mui/icons-material/Numbers';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import LocalConvenienceStoreIcon from '@mui/icons-material/LocalConvenienceStore';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';

const drawerWidth = 240;

export const NavBar = () => {
  const [enableOp] = useState((localStorage.getItem('tipoUsuario') === 'Administrador') ? true : false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const sucursal = localStorage.getItem('sucursalNombre');
  const nombre = localStorage.getItem('nombre');
  const [openConfi, setOpenConfi] = useState(true);
  const [openReporte, setOpenReporte] = useState(true);
  const navigate = useNavigate();

  const handleClickConfi = () => {
    setOpenConfi(!openConfi);
  };
  const handleClickReporte = () => {
    setOpenReporte(!openReporte);
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

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
        {enableOp &&
          <ListItem key='Inventario' disablePadding>
            <ListItemButton
              component={NavLink}
              to='/inventario'
            >
              <ListItemIcon>
                <EditNoteIcon />
              </ListItemIcon>
              <ListItemText primary='Inventario' />
            </ListItemButton>
          </ListItem>
        }
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
        {enableOp &&
          <ListItem key='Usuarios' disablePadding>
            <ListItemButton
              component={NavLink}
              to='/usuarios'
            >
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary='Usuarios' />
            </ListItemButton>
          </ListItem>
        }
        {enableOp &&
          <ListItem key='Cliente' disablePadding>
            <ListItemButton
              component={NavLink}
              to='/clientes'
            >
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary='Cliente' />
            </ListItemButton>
          </ListItem>
        }
      </List>
      <Divider />
      <List >
        <ListItem key='DetalleExpediente' disablePadding>
          <ListItemButton
            component={NavLink}
            to='/detalleExpediente'
          >
            <ListItemIcon>
              <ContactPageIcon />
            </ListItemIcon>
            <ListItemText primary='Detalle Expendiente' />
          </ListItemButton>
        </ListItem>
        <ListItem key='DetalleVenta' disablePadding>
          <ListItemButton
            component={NavLink}
            to='/detalleVentas'
          >
            <ListItemIcon>
              <PointOfSaleIcon />
            </ListItemIcon>
            <ListItemText primary='Detalle Ventas' />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItemButton onClick={handleClickReporte}>
          <ListItemIcon>
            <FolderIcon />
          </ListItemIcon>
          <ListItemText primary="Reportes" />
          {openReporte ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openReporte} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              component={NavLink}
              to='/detalleInventario'
            >
              <ListItemIcon>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText primary="Inventario" />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4 }}
              component={NavLink}
              to='/ventasReporte'
            >
              <ListItemIcon>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText primary="Ventas" />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
      <Divider />
      {
        enableOp &&
        <List>
          <ListItemButton onClick={handleClickConfi}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Configuraciones" />
            {openConfi ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openConfi} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ pl: 4 }}
                component={NavLink}
                to='/rangoFactura'
              >
                <ListItemIcon>
                  <NumbersIcon />
                </ListItemIcon>
                <ListItemText primary="Facturas/Recibo" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                component={NavLink}
                to='/importDatos'
              >
                <ListItemIcon>
                  <CloudUploadIcon />
                </ListItemIcon>
                <ListItemText primary="Importar datos" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                component={NavLink}
                to='/optometristas'
              >
                <ListItemIcon>
                  <TrackChangesIcon />
                </ListItemIcon>
                <ListItemText primary="Optometristas" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                component={NavLink}
                to='/sucursales'
              >
                <ListItemIcon>
                  <LocalConvenienceStoreIcon />
                </ListItemIcon>
                <ListItemText primary="Sucursales" />
              </ListItemButton>
            </List>
          </Collapse>
        </List>
      }
      <Divider />
      <ListItem key='Logout' disablePadding
        sx={{
          color: 'error.main',
          display: { xs: 'block', sm: 'block', md: 'none', lg: 'none' }
        }}
        onClick={logout}
      >
        <ListItemButton        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary='Cerrar sesión' />
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
            <Typography variant='h5' noWrap >
              {sucursal}
            </Typography>
            <Box
              sx={{
                display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', bg: 'flex' }
              }}
            >
              <Typography variant='h6' noWrap sx={{ marginRight: 3 }} >
                {nombre}
              </Typography>
              <Button
                variant='contained'
                color='error'
                onClick={logout}
                endIcon={<LogoutIcon />} >
                Cerrar sesión
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
