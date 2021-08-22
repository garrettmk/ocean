import { NextFunction, Request, Response } from "express";
import { ServerApiContext } from "../interfaces";
import jwt from 'jwt-simple';

export class ServerApiContextMiddleware {
  private context?: ReturnType<ServerApiContext>;
  private secret: string;


  constructor(secret: string) {
    this.secret = secret;
    this.middleware = this.middleware.bind(this);
    this.getContext = this.getContext.bind(this);
  }

  middleware(req: Request, res: Response, next: NextFunction) {
    // Get the access token from the request
    const accessToken = req.headers.authorization;
    
    // Parse the token for the user ID
    const claims = accessToken ? this.parseToken(accessToken) : undefined;
    const userId = claims?.sub;
    
    // Set the context
    this.context = { userId };

    // Next!
    next();
  }


  getContext() {
    return this.context;
  }


  parseToken(accessToken: string) {
    return jwt.decode(accessToken, this.secret);
  }
}