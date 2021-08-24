import { DocumentRepository } from "@/domain";
import cors from 'cors';
import express, { Express } from 'express';
import { graphqlHTTP, RequestInfo } from 'express-graphql';
import { GraphQLError, formatError as defaultFormatError } from "graphql";
import { createServer, Server } from 'http';
import morgan from 'morgan';
import { ServerApi } from "./interfaces";
import { ServerApiContextMiddleware } from './middleware';
import { ServerDocumentInteractor, ServerUserInteractor, UserRepository } from "./usecases";


export class OceanServer {
  private app: Express;
  private server?: Server;

  constructor(users: UserRepository, documents: DocumentRepository, secret: string) {
    // Create the interactors
    const documentInteractor = new ServerDocumentInteractor(documents, users);
    const userInteractor = new ServerUserInteractor(users);

    // Create the api
    const serverApi = new ServerApi(userInteractor, documentInteractor);
    const apiContext = new ServerApiContextMiddleware(secret);

    // Set up the express server
    this.app = express();
    this.app.use(morgan('combined'));
    this.app.use(cors());
    this.app.use(apiContext.middleware);

    this.app.use('/', express.static(__dirname + '/public'))
    this.app.use('/graphql', graphqlHTTP({
      schema: serverApi.getSchema(),
      rootValue: undefined,
      context: apiContext.getContext,
      graphiql: true,
      customFormatErrorFn: this.formatError,
    }));
  }

  listen(port: number = 3000) {
    return new Promise<void>((resolve, reject) => {
      // Create the server explicitly, so we can close() it later
      this.server = createServer(this.app);
      this.server.listen(port, resolve);
    });
  }

  close() {
    this.server?.close();
  }

  private formatError(error: GraphQLError) {
    const { originalError, locations, path } = error;
    if (!originalError)
      return defaultFormatError(error);

    const keys = Object.getOwnPropertyNames(originalError).filter(key => !['name', 'message'].includes(key));
    const extensions = keys.reduce((res, key) => ({ ...res, [key]: (error as any)[key] }), {});

    return {
      message: originalError!.message,
      path,
      locations,
      extensions: {
        ...extensions,
        name: originalError!.name
      }
    };
  }
}