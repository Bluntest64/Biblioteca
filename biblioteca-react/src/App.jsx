import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";

import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom"
import Usuario from "./views/usuario";
import Prestamos from "./views/prestamos";
import Catalogo from "./views/catalogo";
import { Login, Registro } from "./views/autenticacion";


function App() {
  return (
    <BrowserRouter>
      <Navbar/>

      <Routes>

        {/* Añadimos la ruta para tu Dashboard (por ejemplo: /dashboard) */}
        <Route path="/" element={<RutaProtegida><Dashboard /></RutaProtegida>} />

        <Route path="/usuario" element={<RutaProtegida><Usuario /></RutaProtegida>}/>

        <Route path="/prestamos" element={<RutaProtegida><Prestamos /></RutaProtegida>}/>

        <Route path="/catalogo" element={<RutaProtegida><Catalogo /></RutaProtegida>}/>

        <Route path="/registro" element={<RutaPublica><Registro /></RutaPublica>}/>

        <Route path="/login" element={<RutaPublica><Login /></RutaPublica>}/>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

      <Footer />

      </BrowserRouter>

  )
};

function RutaProtegida({ children }) {
  const sesionIniciada = sessionStorage.getItem('biblioteca_sesion') === 'activa';

  return sesionIniciada ? children : <Navigate to="/login" replace />;
}

function RutaPublica({ children }) {
  const sesionIniciada = sessionStorage.getItem('biblioteca_sesion') === 'activa';

  return sesionIniciada ? <Navigate to="/" replace /> : children;
}

export default App; 