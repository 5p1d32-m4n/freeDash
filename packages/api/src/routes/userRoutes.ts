import { Router } from "express";
import { syncUser } from "../controllers/userControllers";
import { getMe } from "../controllers/userControllers";
import { addUserToRequest, jwtCheck } from "../middleware/auth";

const router = Router();

// This rout expects a JWT-validation middleware (e.g., express-oauth2-jwt-bearer)
// to have run and populated 'req.auth' with the token payload.
router.get('/me', jwtCheck, addUserToRequest, getMe);
router.post('/sync', jwtCheck, addUserToRequest, syncUser);

export default router;