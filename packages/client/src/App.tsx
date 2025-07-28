import AuthPage from './pages/Auth/AuthPage';
import './App.css';
import { Auth0Provider } from '@auth0/auth0-react';


function App() {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_REDIRECT_URI;

  if (!domain) {
    throw new Error('REACT_APP_AUTH0_DOMAIN is not set in the .env file.');
  }
  if (!clientId) {
    throw new Error('REACT_APP_AUTH0_CLIENT_ID is not set in the .env file.');
  }
  if (!redirectUri) {
    throw new Error('REACT_APP_REDIRECT_URI is not set in the .env file.');
  }
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={
        {
          redirect_uri: redirectUri,
        }
      }
    >
      <h1>freeDash Client</h1>
      <AuthPage />
    </Auth0Provider>
  );
}

export default App;
