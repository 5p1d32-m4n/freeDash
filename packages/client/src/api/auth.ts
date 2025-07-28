// Handles Auth0 interactions.
import axios from "axios";
import { useAuth0Auth } from "../features/auth/hooks/useAuth0";

export const createdAuthenticatedClient = () => {
    const getToken = useAuth0Auth();

    const client = axios.create({
        baseURL: process.env.API_RUL,
    });

    client.interceptors.request.use(async (config) => {
        const token = await getToken();
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    return client;
};