import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../config/database';

// Type augmentation is now in src/types/express.d.ts
// We keep AuthRequest for backward compatibility but it's now just Request
export interface AuthRequest extends Request {}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token); // Now returns null on failure instead of throwing

        if (!decoded || !decoded.id) {
            res.status(401).json({ message: 'Invalid or expired token' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true, is_active: true },
        });

        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        if (!user.is_active) {
            res.status(403).json({ message: 'User account is deactivated' });
            return;
        }

        req.user = user as any; // Cast as any to satisfy type augmentation if needed
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

/**
 * Role-based access control middleware.
 * Usage: roleMiddleware('ADMIN', 'TEACHER')
 */
export const roleMiddleware = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ message: 'Access denied: insufficient permissions' });
            return;
        }
        next();
    };
};
