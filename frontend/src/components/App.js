import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import './App.css';
import Home from '../pages/Home/Home';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Error404 from '../pages/Error404/Error404';
import ProtectedRoutes from './ProtectedRoutes';
import PersistLogin from './PersistLogin';
import Profile from './Profile/Profile';
import Article from './Article/Article';
import Sidebar from './Sidebar/Sidebar';
import ArticleEditor from '../pages/ArticleEditor/ArticleEditor';
import Read from '../pages/Read/Read';
import Search from '../pages/Search/Search';

function App() {

  return (
    <Router>
      <Routes>        
        <Route element={<PersistLogin />}>
          <Route path='/' element={<Home />} exact/>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/search' element={<Search />} />
          <Route path='/read/:permalink' element={<Read />} />

          <Route element={<ProtectedRoutes />}>
            <Route path='/write' element={<ArticleEditor />} />
            
            <Route element={<Sidebar />}>
              <Route path='/profile' element={<Profile />} />
              <Route path='/article' element={<Article />} />
            </Route>
          </Route>

          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;