import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginLayout from './pages/LoginLayout';
import CharatorPickPage from './pages/CharatorPickPage';
import MainLayout from './pages/MainLayout';
import socketIO from 'socket.io-client';

/** Socket 創建 */
const socket = socketIO.connect('ws://localhost:3001');

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" /> } />
        <Route path="/login" element={<LoginLayout socket={socket} /> } />
        <Route path="/pick" element={<CharatorPickPage socket={socket} /> } />
        <Route path="/main" element={ <MainLayout socket={socket} /> } />
        <Route path="*" element={<h1 className='text-center text-lg font-bold'>Error 404, Page not found</h1> } />
      </Routes>
    </BrowserRouter>
    
  );
}

export default App;
