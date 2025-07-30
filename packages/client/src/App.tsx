import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AuthPage from './pages/Auth/AuthPage';
import HomeDashboard from './pages/Dashboard/HomeDashboard';
import AuthRoute from './routes/AuthRoute';

const App = () => {
  return (
    <Routes>
      {/* Public route for the login page */}
      <Route path="/" element={<AuthPage />} />
      {/* Protected route for the main dashboard */}
      <Route path="/dashboard" element={<AuthRoute component={HomeDashboard} />} />
    </Routes>
  );
};

export default App;
