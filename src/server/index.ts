import { Database } from 'arangojs';
import { ArangoAuthorRepository, ArangoDocumentRepository, ArangoUserRepository } from './interfaces';
import { OceanServer } from './ocean-server';
import { AlreadyExistsError } from './usecases';
export { AuthorizationError } from './usecases';

const db = new Database({ url: 'http://localhost:8529', databaseName: 'ocean' });
const config = {
  db,
  collectionNames: {
    authors: 'authors',
    users: 'users',
    documents: 'documents'
  }
}

// Create the repositories
const authors = new ArangoAuthorRepository(config);
await authors.initialize();

const users = new ArangoUserRepository(authors, config);
await users.initialize();

try {
  const author = await authors.create({ name: 'Luke S.' });
  const user = await users.create('lukeskywalker', { name: 'Luke Skywalker', author });
} catch (error) {
  if (!(error instanceof AlreadyExistsError))
    throw error;
}

const documents = new ArangoDocumentRepository(authors, config);
await documents.initialize();

const app = new OceanServer(users, authors, documents, 'secret');
app.listen(3000);//