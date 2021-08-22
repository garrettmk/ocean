import { DocumentRepository } from "@/domain";
import { ServerDocumentInteractor, ServerUserInteractor, UserRepository } from "./usecases";
import cors from 'cors';
import express, { Express } from 'express';
import { graphqlHTTP } from 'express-graphql';
import morgan from 'morgan';
import { ServerApiContextMiddleware } from './middleware';
import { ServerApi } from "./interfaces";


export class OceanServer {
  private app: Express;

  constructor(users: UserRepository, documents: DocumentRepository) {
    // Create the interactors
    const documentInteractor = new ServerDocumentInteractor(documents, users);
    const userInteractor = new ServerUserInteractor(users);

    // Create the api
    const serverApi = new ServerApi(userInteractor, documentInteractor);
    const apiContext = new ServerApiContextMiddleware();

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

    this.app.listen(3000, () => {
      console.log('Listening on port 3000');
    });
  }
}