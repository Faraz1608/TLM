import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Upload from './pages/Upload';
import Breaks from './pages/Breaks';
import BreakDetail from './pages/BreakDetail';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/breaks" element={<Breaks />} />
          <Route path="/breaks/:id" element={<BreakDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
