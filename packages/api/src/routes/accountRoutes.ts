import { Router } from "express";
import {createAccount} from "../controllers/accountControllers";

const router = Router();

router.post('/createAccount', createAccount);

export default router;