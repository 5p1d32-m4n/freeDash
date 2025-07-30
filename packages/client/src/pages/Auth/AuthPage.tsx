import { useAuth0 } from "@auth0/auth0-react";
import React, {useState} from "react";

interface UserPreferences{
    id: string;
    userId: string;
    weeklyReport: boolean;
    businessHours: number[];
}

interface SafeUser{
    id: string;
    email: string;
    name: string | null;
    timezone: string;
    defaultCurrency: string;
    onboardingStatus: string;
    createdAt: string; // Dates are
    updatedAt: string;
    preferences: UserPreferences | null;
}

interface ApiResponse{
    user: SafeUser;
    token: string;
    isNewUser: boolean;
}

function AuthPage(){
    const {loginWithRedirect, logout, isAuthenticated, user} = useAuth0();


    return(
        <div>
            <h2>Authentication</h2>
            {!isAuthenticated ? (
                <button onClick={() => loginWithRedirect()}>Login</button>
            ):(
                <div>
                    <h3>Welcome, {user?.name}!</h3>
                    <button
                        onClick={() => logout({logoutParams: {returnTo: window.location.origin}})}
                    >Logout</button>
                </div>
            )}
        </div>
    );
}

export default AuthPage;