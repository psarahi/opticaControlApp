import { Route, Routes } from 'react-router-dom';
import { Container } from '@mui/material';

import { 
  Calendar,
  Clientes,
  Patients,
  Info
} from '../pages/index';
import { NavBar } from '../layout/nabvar/NavBar';


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
        <Route path="/pacientes" element={<Patients />} />
        <Route path="/*" element={<Info />} />

      </Routes>
      </Container>
      
    </>

  )
};