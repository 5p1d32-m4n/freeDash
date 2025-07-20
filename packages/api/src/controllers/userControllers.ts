import {RequestHandler} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma,PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();
const JWT = process.env.JWT_SECRET || "deep-secret-key";
const SALT_ROUNDS = process.env.SALT_ROUNDS;

export const syncUser: RequestHandler = async(req, res) => {
    try{
    const auth0Id = req.auth.payload.sub;
    if(await prisma.user.findUnique({where: email})){
        return res.status(400).json({error: 'Email already registered'})
    }
    }catch(error){
        res.json({error: 'Error with your request'});
    }
}