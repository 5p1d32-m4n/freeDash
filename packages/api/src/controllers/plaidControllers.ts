import { RequestHandler } from "express";


export const linkToken: RequestHandler = async (req, res) => {
    try {
        res.status(501).json({ message: 'Not implemented' });
    } catch (error) {
        console.error('Error fetching account by user ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}