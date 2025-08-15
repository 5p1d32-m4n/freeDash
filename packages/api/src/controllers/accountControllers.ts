import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, OnboardingStatus } from '../generated/prisma';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

export const createAccount: RequestHandler = async(req, res) =>{
    try {
        
    } catch (error) {
        
    }
}

export const getUserAccounts: RequestHandler = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

export const getAccountByUserId: RequestHandler = async(req, res) =>{
    try {
        
    } catch (error) {
        
    }
}