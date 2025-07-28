// Handles Auth0 interactions.
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

export const useAuthenticatedClient = () => {
    const { getAccessTokenSilently } = useAuth0();

    const client = axios.create({
        baseURL: process.env.API_RUL,
    });

    client.interceptors.request.use(async (config) => {
        const token = await getAccessTokenSilently();
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    return client;
};