import { RequestHandler } from 'express';
import { PrismaClient } from '../generated/prisma';
import { AccountSchema } from '@free-dash/shared-types';

const prisma = new PrismaClient();

export const createAccount: RequestHandler = async (req, res) => {
    try {
        const userAuth0Id = req.auth?.payload.sub;
        if (!userAuth0Id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Here you can use a Zod schema for validation.
        // For example, you could create an AccountSchema in your shared package.
        const validatedAccountData = AccountSchema.parse(req.body);


        const account = prisma.$transaction(async (tx)=> {
        const newAccount = await tx.account.create({
            data: {
                ...validatedAccountData
            }
        });
        });
        
        return res.status(201).json({ message: 'Account successfully created' });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getUserAccounts: RequestHandler = async (req, res) => {
    try {
        res.status(501).json({ message: 'Not implemented' });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getAccountByUserId: RequestHandler = async (req, res) => {
    try {
        res.status(501).json({ message: 'Not implemented' });
    } catch (error) {
        console.error('Error fetching account by user ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const updateAccountBalances: RequestHandler = async (req, res) => {
    try {
        res.status(501).json({ message: 'Not implemented' });
    } catch (error) {
        console.error('Error fetching account by user ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}