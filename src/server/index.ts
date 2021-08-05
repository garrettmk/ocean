import cors from 'cors';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import morgan from 'morgan';
import { MemoryAuthorRepository, MemoryDocumentRepository, MemoryUserRepository, ServerApi } from "./interfaces";
import { ServerApiContextMiddleware } from './middleware';
import { ServerDocumentInteractor, ServerUserInteractor } from "./usecases";

export { ClientDocumentsGateway, CreateDocumentInput } from './interfaces';


// Create repositories
const authors = new MemoryAuthorRepository();
const documents = new MemoryDocumentRepository(authors);
const users = new MemoryUserRepository(authors);

// For dev purposes, add a single, default user
users.save({
  id: 'SINGLE_USER',
  name: 'Single User'
});

// Create the interactors
const documentInteractor = new ServerDocumentInteractor(documents, users);
const userInteractor = new ServerUserInteractor(users);

// Create the api
const serverApi = new ServerApi(userInteractor, documentInteractor);
const apiContext = new ServerApiContextMiddleware();

// Set up the express server
const app = express();
app.use(morgan('combined'));
app.use(cors());
app.use(apiContext.middleware);

app.use('/graphql', graphqlHTTP({
  schema: serverApi.getSchema(),
  rootValue: undefined,
  context: apiContext.getContext,
  graphiql: true
}));

app.listen(3000, () => {
  console.log('Listening on port 3000');
});