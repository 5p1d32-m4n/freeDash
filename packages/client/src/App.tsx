import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import AuthPage from './pages/Auth/AuthPage';
import HomeDashboard from './pages/Dashboard/HomeDashboard';
import AuthRoute from './routes/AuthRoute';

const App = () => {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="page-loader" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        {/* Replace this with a more sophisticated spinner component later */}
        <h2>Loading...</h2>
      </div>
    );
  }

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
