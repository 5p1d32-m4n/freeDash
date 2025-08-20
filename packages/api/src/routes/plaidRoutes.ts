import { Router } from "express";
import { getPlaidTransactions, createLinkToken, exchangePublicToken } from "../controllers/plaidControllers";
import { jwtCheck, checkPermissions } from "../middleware/auth"

const router = Router();

/**
 * @route POST /api/plaid/link-token
 * @desc Creates a link_token to initiate the Plaid Link flow on the client.
 * Requires user authentication and the 'write:accounts' permission.
 */
router.post(
    '/link-token',
    jwtCheck,
    checkPermissions(['write:accounts']),
    createLinkToken
);

/**
 * @route POST /api/plaid/exchange-public-token
 * @desc Exchanges a public_token for a secure Plaid access token and syncs data.
 * Requires user authentication and the 'write:accounts' permission.
 */
router.post(
    '/exchange-public-token',
    jwtCheck,
    checkPermissions(['write:accounts']),
    exchangePublicToken
);

/**
 * @route GET /api/plaid/transactions
 * @desc Fetches and syncs the latest transactions for a user from their Plaid accounts.
 * The access token is securely retrieved from the database.
 * Requires user authentication and the 'read:transactions' permission.
 */
router.get(
    '/transactions',
    jwtCheck,
    checkPermissions(['read:transactions']),
    getPlaidTransactions
);

export default router;