import { Route, Routes } from 'react-router-dom';

import { Calendar } from '../pages/Calendar';
import { NavBar } from '../layout/nabvar/NavBar';
import { Clientes } from '../pages/Clientes';
import { Info } from '../pages/Info';
import { Container } from '@mui/material';

const drawerWidth = 240;

export const ComponentesRoutes = () => {
  return (
    <>
      <NavBar />
      <Container sx={{marginLeft: { md: `${drawerWidth}px`}}}>
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