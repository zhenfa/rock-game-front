import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginLayout from './pages/LoginLayout';
import CharatorPickPage from './pages/CharatorPickPage';
import MainLayout from './pages/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" /> } />
        <Route path="/login" element={<LoginLayout /> } />
        <Route path="/pick" element={<CharatorPickPage /> } />
        <Route path="/main" element={ <MainLayout /> } />
        <Route path="*" element={<h1 className='text-center text-lg font-bold'>Error 404, Page not found</h1> } />
      </Routes>
    </BrowserRouter>
    
  );
}

export default App;
