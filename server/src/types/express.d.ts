import * as express from 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
      is_active: boolean;
    }

    interface Request {
      user?: User;
    }
  }
}
