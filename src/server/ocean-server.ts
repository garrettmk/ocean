import { AuthorRepository, ContentAnalysisManager, ContentMigrationManager, DocumentLinkRepository, DocumentRepository } from "@/domain";
import cors from 'cors';
import express, { Express } from 'express';
import { graphqlHTTP } from 'express-graphql';
import { formatError as defaultFormatError, GraphQLError, execute, subscribe, GraphQLSchema } from "graphql";
import { createServer, Server } from 'http';
import morgan from 'morgan';
import path from 'path';
import { ServerApi } from "./apis";
import { ServerApiContextMiddleware } from './middleware';
import { ServerDocumentInteractor, ServerUserInteractor, UserRepository } from "./usecases";
import { SubscriptionServer } from "subscriptions-transport-ws";
import jwt from 'jwt-simple';


export type OceanServerDependencies = {
  users: UserRepository,
  authors: AuthorRepository,
  documents: DocumentRepository,
  documentLinks: DocumentLinkRepository,
  migrations: ContentMigrationManager,
  analysis: ContentAnalysisManager,
  secret: string,
  port: number
};

export class OceanServer {
  private app: Express;
  private server: Server;
  private subscriptions: SubscriptionServer;
  private port: number;

  constructor({
    users, 
    authors, 
    documents, 
    analysis, 
    documentLinks: links,
    migrations,
    secret,
    port
  }: OceanServerDependencies) {
    this.port = port;

    // Create the interactors
    const documentInteractor = new ServerDocumentInteractor({ documents, users, analysis, links, migrations });
    const userInteractor = new ServerUserInteractor(users, authors);

    // Create the api
    const serverApi = new ServerApi(userInteractor, documentInteractor);
    const apiContext = new ServerApiContextMiddleware(secret);
    const schema = serverApi.getSchema();

    // Set up the express server
    this.app = express();
    this.app.use(morgan('combined'));
    this.app.use(cors());
    this.app.use(apiContext.middleware);

    // Specific assets are in the public folder
    this.app.use('/public', express.static(__dirname + '/public'));

    // Make sure we can send large documents through the API
    this.app.use(express.json({ limit: '1Mb' }));

    // Route api requests through the GraphQL router
    this.app.use('/graphql', graphqlHTTP({
      schema,
      rootValue: undefined,
      context: apiContext.getContext,
      customFormatErrorFn: this.formatError,
      graphiql: true
    }));

    // All other requests get the SPA
    this.app.use('*', (req, res) => {
      const indexPath = path.resolve(__dirname, 'public', 'index.html');
      res.sendFile(path.resolve(indexPath));
    });

    // Create the HTTP server
    this.server = createServer(this.app);

    // Create a SubscriptionServer to handle GraphQL subscriptions
    this.subscriptions = new SubscriptionServer({
      execute,
      subscribe,
      schema,
      onConnect: apiContext.onConnectSubscription
    }, {
      server: this.server,
      path: '/graphql',
    });
  }

  // Start listening on the specified port
  listen(port: number = this.port) {
    this.port = port;

    return new Promise<void>((resolve, reject) => {
      this.server.listen(port, resolve);
    });
  }

  // Close the servers
  close() {
    this.subscriptions?.close();
    this.server?.close();
  }

  // Some custom error formatting
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