import { Route, Routes } from 'react-router-dom';

import { LoginPage } from '../auth/LoginPage';
import { ComponentesRoutes } from '../components/routes/ComponentsRoutes';
import { Registro } from '../auth/Registro';
import { CrearSucursal } from '../auth/CrearSucursal';

export const AppRouter = () => {

  return (
    <>
      <Routes>
        {/* Login y Registro */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/crearSucursal" element={<CrearSucursal />} />
        <Route path="/" element={<LoginPage />} />

        {/* Componentes */}
        <Route path="/*" element={<ComponentesRoutes />} />
      </Routes>
    </>

  )
}