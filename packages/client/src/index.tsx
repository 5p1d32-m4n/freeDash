import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Auth0Provider } from '@auth0/auth0-react';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
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
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={
        {
          redirect_uri: redirectUri,
        }
      }
    >
    <App />
  </Auth0Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
