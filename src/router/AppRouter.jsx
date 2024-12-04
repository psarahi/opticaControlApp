import { Route, Routes } from 'react-router-dom';

import { LoginPage } from '../auth/LoginPage';
import { ComponentesRoutes } from '../components/routes/ComponentsRoutes';
import { useEffect } from 'react';

if (window.innerWidth < 2000) {
  document.body.style.zoom = '80%'
} else {
  document.body.style.zoom = '100%'
}

export const AppRouter = () => {
  useEffect(() => {
    if (window.innerWidth < 2000) {
      document.body.style.zoom = '80%'
    } else {
      document.body.style.zoom = '100%'
    }
  }, [])

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