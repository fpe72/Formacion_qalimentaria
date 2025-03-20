import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Protected from './pages/Protected';
import ModulesView from './pages/ModulesView';
import ProgressView from './pages/ProgressView';
import CreateModule from './pages/CreateModule';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/protected" element={<Protected />} />
          <Route path="/modules" element={<ModulesView />} />
          <Route path="/progress" element={<ProgressView />} />
          <Route path="/create-module" element={<CreateModule />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
