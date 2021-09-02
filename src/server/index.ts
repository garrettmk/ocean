import { Database } from 'arangojs';
import { ArangoAuthorRepository } from './interfaces/arango-author-repository';
import { ArangoDocumentRepository } from './interfaces/arango-document-repository';
import { ArangoUserRepository } from './interfaces/arango-user-repository';
import { OceanServer } from './ocean-server';
export { AuthorizationError } from './usecases';


// Connect to the database
const systemDb = new Database({
  url: 'http://localhost:8529',
});

const existingDatabases = await systemDb.listDatabases();
const oceanDb = existingDatabases.includes('ocean') 
  ? systemDb.database('ocean')
  : await systemDb.createDatabase('ocean');


// Create the repositories
const authors = new ArangoAuthorRepository(oceanDb);
await authors.initialize();

const users = new ArangoUserRepository(authors, oceanDb);
await users.initialize();

const documents = new ArangoDocumentRepository(authors, oceanDb);
await documents.initialize();

// For dev purposes, add a single, default user
users.save({
  id: 'lukeskywalker',
  name: 'Luke Skywalker'
});

const app = new OceanServer(users, documents, 'secret');
app.listen(3000);//