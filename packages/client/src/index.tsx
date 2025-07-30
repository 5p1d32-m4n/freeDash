import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Auth0Provider, AppState } from '@auth0/auth0-react';
import App from './App';

// A wrapper component is needed because the `useNavigate` hook from react-router-dom
// can only be used within a component that is a descendant of <BrowserRouter>.
const Auth0ProviderWithRedirectCallback = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE;
  const redirectUri = process.env.REACT_APP_REDIRECT_URI;

  const onRedirectCallback = (appState?: AppState) => {
    // Use react-router's navigate function to redirect the user to the
    // intended page after a successful login.
    navigate(appState?.returnTo || '/dashboard');
  };

  // The Auth0Provider will not function correctly if these values are missing.
  if (!(domain && clientId && audience && redirectUri)) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#ffcccc', border: '1px solid red', margin: '20px' }}>
        <h1>Missing Auth0 Configuration</h1>
        <p>
          The application is missing required Auth0 environment variables. Please ensure that the following are set in your <code>.env.local</code> file in the <code>packages/client</code> directory:
        </p>
        <ul>
          <li><code>REACT_APP_AUTH0_DOMAIN</code></li>
          <li><code>REACT_APP_AUTH0_CLIENT_ID</code></li>
          <li><code>REACT_APP_AUTH0_AUDIENCE</code></li>
          <li><code>REACT_APP_REDIRECT_URI</code></li>
        </ul>
        <p><strong>Important:</strong> You must restart your development server after creating or modifying the <code>.env.local</code> file.</p>
      </div>
    );
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      onRedirectCallback={onRedirectCallback}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
      }}
    >
      {children}
    </Auth0Provider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithRedirectCallback>
        <App />
      </Auth0ProviderWithRedirectCallback>
    </BrowserRouter>
  </React.StrictMode>
);
