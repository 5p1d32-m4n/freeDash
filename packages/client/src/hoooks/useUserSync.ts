import { useAuth0 } from "@auth0/auth0-react";
import { useMemo } from "react";

interface AuthUser{
    id: string;
    name?: string;
    email: string;
    picture?: string
}

interface AuthHookReturn{
    isAuthenticated: boolean;
    isLoading: boolean;
    user: AuthUser | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    getAccessToken: () => Promise<string>;
}

const useAuth = ():AuthHookReturn => {
    const {
    isAuthenticated,
    isLoading,
    user: auth0User,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
    } = useAuth0();

    //Memoize the transformed user object:
    const user = useMemo(()=>{
        if(!auth0User) return null;

        return{
            id: auth0User.sub || '',
            name: auth0User.name || '',
            email: auth0User.email || '',
            picture: auth0User.picture||'',
        }
    },[auth0User]);

    const login= async ()=>{
        await loginWithRedirect();
    }

    const logout = async ()=>{
        await auth0Logout({logoutParams: {returnTo: window.location.origin}});
    }

    const getAccessToken = async ()=>{
        try{
            return await getAccessTokenSilently();
        }catch(error){
            console.error('Error getting access token: ', error)
            throw error;
        }
    }

    return{
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    getAccessToken,
    };
}

export {};