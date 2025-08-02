import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const HomePage = () => {
    const { isAuthenticated } = useAuth0();

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Welcome to freeDash</h1>
            <p>This is the public landing page for the application.</p>
            {!isAuthenticated && (
                <p>Please log in or sign up to access your dashboard.</p>
            )}
        </div>
    );
};

export default HomePage;