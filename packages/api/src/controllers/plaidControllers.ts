import { RequestHandler } from "express";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
// I need to import jwt for token checks and "checkPermissions(['write:accounts'])"

const configuration = new Configuration({
    basePath: process.env.PLAID_ENV,
    baseOptions: {
        headers:{
            'PLAID_CLIENT_ID': process.env.PLAID_CLIENT_ID,
            'PLAID_SECRET': process.env.PLAID_SECRET,
            'Plaid-Version': '2020-09-14' // Current API version
        }
    }
});

const plaidClient = new PlaidApi(configuration);

export const createLinkToken: RequestHandler = async (req, res) => {
    try {
        const userAuth0Id = req.auth?.payload.sub;
        const response = await plaidClient.linkTokenCreate({
            user: {client_user_id: userAuth0Id!},
            client_name: 'FreeDash',
            products: ['transactions' as any],
            country_codes: ['US' as any],
            language: 'en'
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching account by user ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const exchangePublicToken: RequestHandler = async (req, res) => {
    try {
        const {public_token} = req.body;
        const response = await plaidClient.itemPublicTokenExchange({
            public_token
        });

        // I have to store these securely.
        const {access_token, item_id} = response.data;

        return res.json({access_token, item_id});
    } catch (error) {
        console.error('Error fetching account by user ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getPlaidTransactions: RequestHandler = async(req, res) =>{
    try {

        const { access_token } = req.body;
        const response = await plaidClient.transactionsGet({
            access_token,
            start_date: '2023-01-01',
            end_date: '2023-12-31',
            options: { count: 100, offset: 0 }
        });

        res.json(response.data);
    } catch (error) {
        
    }
}