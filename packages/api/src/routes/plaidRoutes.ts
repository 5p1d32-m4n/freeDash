import { Router } from "express";
import { getPlaidTransactions, createLinkToken, exchangePublicToken } from "../controllers/plaidControllers";
import {} from "../middleware/auth"

const router = Router();

router.get('/getPlaidTransactions', getPlaidTransactions);

router.post('/createLinkToken',createLinkToken);
router.post('/exchangePublicToken', exchangePublicToken);