import { useAuth0 } from "@auth0/auth0-react";
import React, {useState} from "react";

interface Dashboard{};

const AuthPage = () => {
    const {user, logout, isAuthenticated} = useAuth0();

    return(
        <div>
            <h1>Home Dashbaord</h1>
        </div>
    )
}