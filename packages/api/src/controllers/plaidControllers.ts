import { RequestHandler } from "express";
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode, Transaction } from "plaid";
import { PrismaClient, TransactionType, AccountType, TransactionStatus } from "../generated/prisma";
import { auth } from 'express-oauth2-jwt-bearer';

// I need to import jwt for token checks and "checkPermissions(['write:accounts'])" - DONE
// This is the setup for the auth middleware. You would then use `checkJwt` in your routes.
// e.g. router.post('/link-token', checkJwt, createLinkToken);
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE!,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL!,});

const prisma = new PrismaClient();
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

/**
 * Maps Plaid's string enums to your Prisma enums
 */
const mapPlaidAccountType = (plaidType: string): AccountType | undefined => {
    switch(plaidType) {
        case 'checking': return AccountType.checking;
        case 'savings': return AccountType.savings;
        case 'credit card': return AccountType.credit;
        default: return undefined;
    }
};

const mapPlaidTransactionType = (plaidCategories: string[]): TransactionType => {
    // Plaid's category system is hierarchical. You'd check for a top-level category first.
    if (plaidCategories.includes('Payroll') || plaidCategories.includes('Interest')) {
        return TransactionType.income;
    }
    // You would add more logic here to handle other specific cases.
    // For now, assume all others are an expense.
    return TransactionType.expense;
};

const mapPlaidTransactionStatus = (plaidStatus: string): TransactionStatus | undefined => {
    switch(plaidStatus) {
        case 'pending': return TransactionStatus.pending;
        case 'posted': return TransactionStatus.posted;
        default: return undefined;
    }
};


/**
 * @route POST /api/plaid/link-token
 * @desc Creates a link_token to initiate the Plaid Link flow on the client.
 * The link_token is temporary and does not need to be stored.
 */
export const createLinkToken: RequestHandler = async (req, res) => {
    try {
        const userAuth0Id = req.auth?.payload.sub;
        const response = await plaidClient.linkTokenCreate({
            user: {client_user_id: userAuth0Id!},
            client_name: 'FreeDash',
            products: [Products.Transactions],
            country_codes: [CountryCode.Us],
            language: 'en'
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching account by user ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * @route POST /api/plaid/exchange-public-token
 * @desc Exchanges a public_token for a secure access_token and syncs accounts/transactions.
 * This is the most critical backend endpoint.
 */
export const exchangePublicToken: RequestHandler = async (req, res) => {
    try {
        const {public_token} = req.body;
        const userAuth0Id = req.auth?.payload.sub;

        if(!userAuth0Id){
            return res.status(401).json({error: 'User not authenticated'});
        }

        // Exchange the public token for a permanent access token and itemId
        const response = await plaidClient.itemPublicTokenExchange({
            public_token
        });

        // I have to store these securely.
        const {access_token, item_id} = response.data;

        // --- ATOMIC TRANSACTION ---
        await prisma.$transaction(async(tx)=> {
            // Step 1. Create a new PlaidItem record to store the secure tokens
            const newPlaidItem = await tx.plaidItem.create({
                data:{
                    plaidItemId: item_id,
                    accessToken: access_token,
                    userId: userAuth0Id
                }
            })

            // Step 2. Fetch the accounts associated with this Plaid item.
            const accountsResponse = await plaidClient.accountsGet({access_token});
            const accounts = accountsResponse.data.accounts;

            // Step 3. Loop through the accounts and create them in your database

            for(const account of accounts){
                // the function 'upsert' handles cases where the account might already exists
                const createdAccount = await tx.account.upsert({
                    where: {plaidAccountId: account.account_id},
                    update: {balance: account.balances.current ?? 0, lastSynced: new Date()},
                    create:{
                        plaidAccountId: account.account_id,
                        name: account.name,
                        officialName: account.official_name,
                        type: mapPlaidAccountType(account.type)!,
                        balance: account.balances.current ?? 0,
                        lastSynced: new Date(),
                        userId: userAuth0Id,
                        plaidItemId: newPlaidItem.id
                    }
                });

                // Step 4. Fetch and sync initial transactions for each account (inside the for loop for accounts).
                const transactionResponse = await plaidClient.transactionsGet({
                    access_token,
                    //TODO: replace these with parameters
                    start_date: '2024-01-01',
                    end_date: '2025-01-01',
                    options: {
                        count: 500
                    }
                });

                const transactions = transactionResponse.data.transactions;
                for(const transaction of transactions){
                    await tx.transaction.upsert({
                        where: {plaidTransactionId: transaction.transaction_id},
                        update:{amount: transaction.amount, status: mapPlaidTransactionStatus((transaction as any).status!)!},
                        create: {
                            plaidTransactionId: transaction.transaction_id,
                            amount: transaction.amount,
                            currency: transaction.iso_currency_code!,
                            date: new Date(transaction.date),
                            merchant: transaction.merchant_name,
                            plaidCategory: transaction.category as any,
                            status: mapPlaidTransactionStatus((transaction as any).status!)!,
                            type: mapPlaidTransactionType(transaction.category!), // Set a default or map to Plaid's type
                            userId: userAuth0Id,
                            accountId: createdAccount.id
                        }
                    })
                }
            }

        });

        return res.json({message: 'Plaid public token exchanged successfully.'});
    } catch (error) {
        console.error('Error fetching account by user ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * @route POST /api/plaid/sync-data
 * @desc Fetches and syncs the latest transactions for a user from their Plaid accounts.
 * The access token is securely retrieved from the database.
 */
export const getPlaidTransactions: RequestHandler = async(req, res) =>{
    try {

        const userAuth0Id = req.auth?.payload.sub;
        if(!userAuth0Id){
            return res.status(401).json({error: 'User not authenticated'});
        }

        const plaidItem = await prisma.plaidItem.findFirst({
            where: {userId: userAuth0Id},
            include: {accounts: true}
        });

        if(!plaidItem){
            return res.status(404).json({message: 'Plaid connection not found for user.'})
        }

        const {accessToken} = plaidItem;
        
        const transactionsResponse = await plaidClient.transactionsGet({
                    access_token: accessToken,
                    //TODO: replace these with parameters
                    start_date: '2024-01-01',
                    end_date: '2025-01-01',
        });
        const transactions = transactionsResponse.data.transactions;
        //create or update plaid transactions at this point
        await prisma.$transaction(async (tx) => {
            for(const transaction of transactions) {
                const account = plaidItem.accounts.find(a => a.plaidAccountId === transaction.account_id);
                if (!account) continue; // Skip if no matching local account found

                await tx.transaction.upsert({
                    where: { plaidTransactionId: transaction.transaction_id },
                    update: {
                        amount: transaction.amount,
                        status: mapPlaidTransactionStatus((transaction as any).status!)!,
                        date: new Date(transaction.date)
                    },
                    create: {
                        plaidTransactionId: transaction.transaction_id,
                        amount: transaction.amount,
                        currency: transaction.iso_currency_code!,
                        date: new Date(transaction.date),
                        merchant: transaction.merchant_name ?? null,
                        plaidCategory: transaction.category as any,
                        status: mapPlaidTransactionStatus((transaction as any).status!)!,
                        type: mapPlaidTransactionType(transaction.category!),
                        userId: userAuth0Id,
                        accountId: account.id
                    }
                });
            }
        });

        const localTransactions = await prisma.transaction.findMany({
            where: {userId: userAuth0Id},
            orderBy: {date: 'desc'}
        })

        return res.json(localTransactions);
    } catch (error) {
        console.error('Error fetching transactions for this user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}