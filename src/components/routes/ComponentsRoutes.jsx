import { Route, Routes } from 'react-router-dom';
import {
  Inventario,
  Pacientes,
  DetalleVentas
} from '../pages/index';
import { NavBar } from '../layout/nabvar/NavBar';

const drawerWidth = 240;

export const ComponentesRoutes = () => {
  return (
    <>
      <NavBar />
      <div style={{ marginLeft: `${drawerWidth + 10}px` }}>

        <Routes>
          {/* Componentes */}
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/detalleVentas" element={<DetalleVentas />} />
          <Route path="/*" element={<Pacientes />} />

        </Routes>
      </div>

    </>

  )
};