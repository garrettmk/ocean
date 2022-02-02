import { NextFunction, Request, Response } from "express";
import { ServerApiContext } from "../apis";
import jwt from 'jwt-simple';

export class ServerApiContextMiddleware {
  private context?: ReturnType<ServerApiContext>;
  private secret: string;


  constructor(secret: string) {
    this.secret = secret;
    
    // These are passed as standalone functions to
    // express, the graphql schema, and the subscription
    // server, so bind them here
    this.middleware = this.middleware.bind(this);
    this.getContext = this.getContext.bind(this);
    this.onConnectSubscription = this.onConnectSubscription.bind(this);
  }

  // The Express middleware - decodes the auth token, if any
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

  // Same as above, but for websocket connections
  onConnectSubscription(connectionParams: any) {
    const token = connectionParams.authorization;
    const claims = token ? this.parseToken(token) : undefined;
    const userId = claims?.sub;

    const context: ReturnType<ServerApiContext> = {
      userId
    };

    return context;
  }


  // Passed to the GraphQL resolvers
  getContext() {
    return this.context;
  }

  // Decode a jwt using the secret
  parseToken(accessToken: string) {
    return jwt.decode(accessToken, this.secret);
  }
}