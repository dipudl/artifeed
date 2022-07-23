import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import './App.css';
import Home from '../pages/Home/Home';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Error404 from '../pages/Error404/Error404';
import Dashboard from '../pages/Dashboard/Dashboard'
import ProtectedRoutes from './ProtectedRoutes';
import PersistLogin from './PersistLogin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} exact/>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        
        <Route element={<PersistLogin />}>
          <Route element={<ProtectedRoutes />}>
            <Route path='/dashboard' element={<Dashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
}

export default App;