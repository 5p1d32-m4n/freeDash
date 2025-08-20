import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import { auth } from 'express-oauth2-jwt-bearer';
import plaidRoutes from './routes/plaidRoutes';
import userRoutes from "./routes/userRoutes";
import * as dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Authorization middleware. When this is used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER_URL,
});

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for your frontend application
app.use(cors({ origin: 'http://localhost:3000' }));

app.use('api/plaid', plaidRoutes);
app.use('api/users', userRoutes);

// This is a public route that requires no authentication
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: "Hello FreeDasher. This is a public endpoint." });
});

// This is a protected route that requires a valid access token
app.get('/api/protected-greetings', checkJwt, (req: Request, res: Response) => {
    res.status(200).json({ message: "Hello from a protected endpoint! You are authenticated." });
});

// Starting the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});