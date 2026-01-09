import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from './hooks/useTheme';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import TailwindToPdf from './pages/TailwindToPdf';
import HtmlToPdf from './pages/HtmlToPdf';

function App() {
  const { theme } = useTheme();

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tailwind-to-pdf" element={<TailwindToPdf />} />
        <Route path="/html-to-pdf" element={<HtmlToPdf />} />
      </Routes>
      <ToastContainer position="bottom-right" theme={theme} />
    </>
  );
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth;
