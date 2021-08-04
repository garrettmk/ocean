import { NextFunction, Request, Response } from "express";
import { ServerApiContext } from "../interfaces";


export class ServerApiContextMiddleware {
  private context?: ReturnType<ServerApiContext>;


  constructor() {
    this.middleware = this.middleware.bind(this);
    this.getContext = this.getContext.bind(this);
  }

  middleware(req: Request, res: Response, next: NextFunction) {
    // Get the access token from the request
    // const accessToken = req.headers.authorization;
    const accessToken = 'token';
    
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
    // TODO: the crypto stuff
    return {
      sub: 'SINGLE_USER'
    }
  }
}