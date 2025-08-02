import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Navbar from './components/navigation/Navbar';
import AuthRoute from './routes/AuthRoute';
import HomePage from './pages/HomePage';
import AuthPage from './pages/Auth/AuthPage';
import HomeDashboard from './pages/Dashboard/HomeDashboard';

// Placeholders for pages found in Navbar.tsx. You can replace these with your actual components.
const ProfilePage = () => <div style={{ padding: '20px' }}>User Profile Page (Protected)</div>;
const AboutPage = () => <div style={{ padding: '20px' }}>About Page (Public)</div>;
const PricingPage = () => <div style={{ padding: '20px' }}>Pricing Page (Public)</div>;

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
    <div>
      <Navbar />
      <main className='main-content'>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<AuthRoute component={HomeDashboard} />} />
          <Route path="/profile" element={<AuthRoute component={ProfilePage} />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
