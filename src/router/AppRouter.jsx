import { Route, Routes } from 'react-router-dom';

import { LoginPage } from '../auth/LoginPage';
import { ComponentesRoutes } from '../components/routes/ComponentsRoutes';
import { PieDePagina } from '../components/layout/PieDePagina';

export const AppRouter = () => {
  return (
    <>
      <Routes>
        {/* Login y Registro */}
        <Route path="login" element={<LoginPage />} />

        {/* Componentes */}
        <Route path="/*" element={<ComponentesRoutes />} />
      </Routes>
      <PieDePagina />
    </>

  )
}