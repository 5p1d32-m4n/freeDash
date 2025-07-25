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

interface ApiReponse{
    user: SafeUser;
    token: string;
    isNewUser: boolean;
}

function AuthPage(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [response, setResponse] = useState<ApiReponse | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setResponse(null);

        // Replace this with ngrok url
        const API_URL = ``;

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json', 
                },
                body: JSON.stringify({email, password, name: name || undefined}),
            });

            const data = await res.json();

            if(!res.ok){
                throw new Error(data.error);
            }

            setResponse(data as ApiReponse);
        } catch (err:any) {
            setError(err.message);
            console.error('Sync error: ', err);
        }
    }
    return(
        <div>
            <h2>Register or Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="">Name (optional, for new users):</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="">Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <button type="submit">Sync User (Login/Register)</button>
            </form>

            {error && <p style={{ color: 'red'}}>Error: {error}</p>}

            {response && (
                <div>
                    <h3>Success!</h3>
                    <p>{response.isNewUser ? 'New user created.': 'Logged in successfully.'}</p>
                    <h4>User Infor:</h4>
                    <pre>{JSON.stringify(response.user, null, 2)}</pre>
                    <h4>JWT Token:</h4>
                    <pre style={{wordWrap: 'break-word'}}>{response.token}</pre>
                </div>
            )}
        </div>
    );
}

export default AuthPage;