import { Route, Routes } from 'react-router-dom';

import { LoginPage } from '../auth/LoginPage';
import { ComponentesRoutes } from '../components/routes/ComponentsRoutes';
import { Registro } from '../auth/Registro';
import { CrearSucursal } from '../auth/CrearSucursal';

export const AppRouter = () => {
  console.log(window.innerWidth, 'Width');
  console.log(window.innerHeight, ' Height');

  if (window.innerWidth > 1500 && window.innerWidth < 1900) {
    document.body.style.zoom = '80%'
  } else if (window.innerWidth < 1500) {
    document.body.style.zoom = '75%'
  } else {
    document.body.style.zoom = '100%'
  }

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