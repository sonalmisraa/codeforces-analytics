import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { sendError } from '../utils/response';
import logger from '../utils/logger';
import prisma from '../config/prisma';

/**
 * Verify Clerk JWT token and attach userId to request.
 * In production, use @clerk/clerk-sdk-node's ClerkExpressRequireAuth().
 * This middleware extracts the userId from the Authorization header (Bearer token)
 * and looks up the user in our DB.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Unauthorized: No token provided', 401);
      return;
    }

    // In production: verify JWT with Clerk's JWKS
    // For now: extract clerkId from the token payload (set by frontend)
    const token = authHeader.substring(7);

    // Decode the JWT to get the sub claim (Clerk user ID)
    // In production, use: import { verifyToken } from '@clerk/clerk-sdk-node';
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) {
      sendError(res, 'Unauthorized: Invalid token format', 401);
      return;
    }

    const payload = JSON.parse(
      Buffer.from(payloadBase64, 'base64').toString('utf-8')
    );

    const clerkId = payload.sub;
    if (!clerkId) {
      sendError(res, 'Unauthorized: Invalid token payload', 401);
      return;
    }

    // Extract basic info from JWT claims (Clerk embeds email + name in token)
    const email: string = payload.email ?? `${clerkId}@clerk.local`;
    const name: string | undefined = payload.name ?? payload.full_name ?? undefined;
    const avatar: string | undefined = payload.image_url ?? payload.picture ?? undefined;

    // Auto-upsert: create the user on first login, update on subsequent logins
    const user = await prisma.user.upsert({
      where: { clerkId },
      create: { clerkId, email, name, avatar },
      update: {
        // Only update email/avatar if they changed — don't overwrite user-set fields
        email,
        ...(avatar && { avatar }),
      },
    });

    req.userId = user.id;
    req.clerkId = clerkId;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    sendError(res, 'Unauthorized: Token verification failed', 401);
  }
}

/**
 * Optional auth - attaches user info if token present, but doesn't block
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) {
      next();
      return;
    }

    const payload = JSON.parse(
      Buffer.from(payloadBase64, 'base64').toString('utf-8')
    );

    const clerkId = payload.sub;
    if (clerkId) {
      const email: string = payload.email ?? `${clerkId}@clerk.local`;
      const name: string | undefined = payload.name ?? payload.full_name ?? undefined;
      const avatar: string | undefined = payload.image_url ?? payload.picture ?? undefined;

      const user = await prisma.user.upsert({
        where: { clerkId },
        create: { clerkId, email, name, avatar },
        update: { email, ...(avatar && { avatar }) },
      });
      req.userId = user.id;
      req.clerkId = clerkId;
    }
  } catch {
    // Silently fail for optional auth
  }
  next();
}
