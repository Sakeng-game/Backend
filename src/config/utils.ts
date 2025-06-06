import jwt from 'jsonwebtoken';
import { Response } from 'express';

type TokenPayload = {
    userId: string;
};

type Tokens = {
    accessToken: string;
    refreshToken: string;
};


export const generateTokens = (userId: string, res: Response): Tokens => {
    // Generate access token (short-lived)
    const accessToken = jwt.sign(
        { userId }, 
        process.env.JWT_ACCESS_SECRET as string, 
        { expiresIn: '15m' }
    );
 console.log("Access Token: ",process.env.JWT_ACCESS_SECRET );
    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
        { userId }, 
        process.env.JWT_REFRESH_SECRET as string, 
        { expiresIn: '7d' }
    );
    console.log("Access Token: ",process.env.JWT_REFRESH_SECRET );


    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== 'development',
    });

    return { accessToken, refreshToken };
};