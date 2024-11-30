import { Route, Routes } from 'react-router-dom';

import { LoginPage } from '../auth/LoginPage';
import { ComponentesRoutes } from '../components/routes/ComponentsRoutes';

if (window.innerWidth < 1600) {
  document.body.style.zoom = '85%'
} else {
  document.body.style.zoom = '100%'
}

export const AppRouter = () => {
  return (
    <>
      <Routes>
        {/* Login y Registro */}
        <Route path="login" element={<LoginPage />} />

        {/* Componentes */}
        <Route path="/*" element={<ComponentesRoutes />} />
      </Routes>
    </>

  )
}