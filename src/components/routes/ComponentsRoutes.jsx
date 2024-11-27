import { Route, Routes } from 'react-router-dom';
import {
  Inventario,
  Pacientes,
  DetalleVentas,
  RangoFacturas,
  DetalleExpediente
} from '../pages/index';
import { NavBar } from '../layout/nabvar/NavBar';
import { DetalleInventarioVendido } from '../pages/reportes/DetalleInventarioVendido';
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
          <Route path="/detalleExpediente" element={<DetalleExpediente />} />
          <Route path="/rangoFactura" element={<RangoFacturas />} />
          <Route path="/detalleInventario" element={<DetalleInventarioVendido />} />
          {/* <Route path="/reporte" element={<reporteRoutes />} /> */}

          <Route path="/*" element={<Pacientes />} />
        </Routes>
      </div>

    </>

  )
};