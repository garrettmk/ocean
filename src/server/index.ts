import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';

import { DocumentsGraphQLApi, MemoryAuthorRepository, MemoryDocumentRepository, MemoryUserRepository } from "./interfaces";
import { DocumentInteractor } from "./usecases";


// Create repositories
const authors = new MemoryAuthorRepository();
const documents = new MemoryDocumentRepository(authors);
const users = new MemoryUserRepository(authors);

// Create the interactor
const documentInteractor = new DocumentInteractor(documents, users);

// Create the web service
const documentsApi = new DocumentsGraphQLApi(documentInteractor);

// TODO: register the api schema with express
const schema = documentsApi.getSchema();


// Set up the express server
const app = express();
app.use(cors);
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

app.listen(3000);