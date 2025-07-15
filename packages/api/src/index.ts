import express, {Request, Response, Application} from 'express';

const app: Application = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// Test route
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({message: "Hello FreeDasher."});
});

// API routes
app.get('/api/greetings', (req: Request, res: Response) => {

});

// Starting the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});