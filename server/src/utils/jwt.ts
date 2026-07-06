import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_sadeem_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecretjwtrefreshkey_sadeem_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = '7d';

export const generateToken = (userId: string, role: string): string => {
    return jwt.sign({ id: userId, role }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
};

/**
 * Verifies an access token. Returns the decoded payload or null if invalid/expired.
 */
export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
};

export const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
};

/**
 * Verifies a refresh token. Returns the decoded payload or null if invalid/expired.
 */
export const verifyRefreshToken = (token: string): any => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch {
        return null;
    }
};
