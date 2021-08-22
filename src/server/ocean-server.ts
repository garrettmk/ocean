import { DocumentRepository } from "@/domain";
import { ServerDocumentInteractor, ServerUserInteractor, UserRepository } from "./usecases";
import cors from 'cors';
import express, { Express } from 'express';
import { graphqlHTTP } from 'express-graphql';
import morgan from 'morgan';
import { ServerApiContextMiddleware } from './middleware';
import { ServerApi } from "./interfaces";
import { createServer, Server } from 'http';


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
      graphiql: true
    }));
  }

  listen(port: number, callback?: () => void) {
    // Create the server explicitly, so we can close() it later
    this.server = createServer(this.app);
    this.server.listen(port, undefined, undefined, callback);
  }

  close() {
    this.server?.close();
  }
}