
import { withAuthenticationRequired } from '@auth0/auth0-react';
import React from 'react';

// This component ensures that the user is authenticated before rendering its children.
// If the user is not authenticated, they will be redirected to the login page.
// It uses the withAuthenticationRequired Higher-Order Component from the Auth0 SDK.
const AuthRoute = ({ component }: { component: React.ComponentType }) => {
  const Component = withAuthenticationRequired(component, {
    // You can add a placeholder component to show while the user is being redirected.
    onRedirecting: () => <div>Loading...</div>,
  });

  return <Component />;
};

export default AuthRoute;
