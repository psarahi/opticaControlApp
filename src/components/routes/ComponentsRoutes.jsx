import { Route, Routes } from 'react-router-dom';

import MenuIcon from "@mui/icons-material/Menu";
import InboxIcon from "@mui/icons-material/Inbox";
import DraftsIcon from "@mui/icons-material/Drafts";

import { Calendar } from '../pages/Calendar';
import { NavBar } from '../layout/nabvar/NavBar';
import { Clientes } from '../pages/Clientes';
import { Info } from '../pages/Info';
import { Container } from '@mui/material';

const navegationLinks = [
  {
      title: 'Home',
      path: '/',
      icon: <InboxIcon />,
  },
  {
      title: 'Login',
      path: '/login',
      icon: <DraftsIcon />,
  },
  {
      title: 'Register',
      path: '/register',
      icon: <MenuIcon />,
  },
];

export const ComponentesRoutes = () => {
  return (
    <>
      <NavBar />
      <Container sx={{marginLeft: '240px'}}>
        <Routes>

        {/* Componentes */}
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/info" element={<Info />} />
        <Route path="/calendar" element={<Calendar />} />

        <Route path="/*" element={<Info />} />

      </Routes>
      </Container>
      
    </>

  )
};