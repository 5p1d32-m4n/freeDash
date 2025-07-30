import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import LoginButton from "../../components/auth/LoginButton";

function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if user is already authenticated
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div>
      <h2>Welcome to freeDash</h2>
      <p>Please log in to continue.</p>
      <LoginButton />
    </div>
  );
}

export default AuthPage;