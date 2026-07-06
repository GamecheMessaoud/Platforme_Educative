import { Response } from 'express';

// Keeps track of active SSE streams per user
const userConnections = new Map<string, Set<Response>>();

/**
 * Adds a new SSE connection for a user.
 */
export const addSseConnection = (userId: string, res: Response) => {
    if (!userConnections.has(userId)) {
        userConnections.set(userId, new Set());
    }
    const connections = userConnections.get(userId)!;
    connections.add(res);

    // Setup heartbeat
    const interval = setInterval(() => {
        res.write(':\n\n'); // SSE comment as heartbeat to keep connection alive
    }, 30000);

    // On close, remove connection
    res.on('close', () => {
        clearInterval(interval);
        connections.delete(res);
        if (connections.size === 0) {
            userConnections.delete(userId);
        }
    });
};

/**
 * Sends a notification directly to a connected user immediately.
 * Provide the payload that you want to send.
 */
export const sendSseNotification = (userId: string, data: any) => {
    const connections = userConnections.get(userId);
    if (!connections) return;

    connections.forEach((res) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
};
