import AuthPage from './pages/Auth/AuthPage';
import './App.css';
import { Auth0Provider } from '@auth0/auth0-react';

function App() {
  return (
    <Auth0Provider
      domain={process.env.AUTH0_DOMAIN ?? ""}
      clientId={process.env.AUTH0_CLIENT_ID ?? ""}
      authorizationParams={
        {
          redirect_uri : process.env.REDIRECT_URI,
          audience: process.env.AUTH0_AUDIENCE,
        }
      }
    >
    <h1>freeDash Client</h1>
    <AuthPage />
    </Auth0Provider>
  );
}

export default App;
