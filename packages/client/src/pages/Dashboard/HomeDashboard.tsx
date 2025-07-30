import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import LogoutButton from "../../components/auth/LogoutButton";

const HomeDashboard = () => {
    const { user } = useAuth0();

    return(
        <div>
            <h1>Home Dashboard</h1>
            <h2>Welcome, {user?.name}!</h2>
            <p>This is your protected dashboard page.</p>
            <LogoutButton />
        </div>
    )
}

export default HomeDashboard;