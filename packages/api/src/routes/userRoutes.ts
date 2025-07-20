import { Request, Response, Router } from "express";
import {syncUser} from "../controllers/userControllers";

const { auth } = require('express-openid-connect');
const router = Router();
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:3001',
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_URL
};

// Sync logic for registration & login
router.post('/sync', (req: Request, res: Response)=> {
    res.status(200).send('Registering...');
});
