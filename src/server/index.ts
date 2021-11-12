import { DefaultAnalysisManager, DefaultMigrationManager, defaultAnalyzers, defaultMigrations } from '@/content';
import { AlreadyExistsError } from '@/domain';
import { Database } from 'arangojs';
import { ArangoAuthorRepository, ArangoDocumentLinkRepository, ArangoDocumentRepository, ArangoUserRepository, WebContentImporter } from './interfaces';
import { OceanServer } from './ocean-server';
export { AuthorizationError } from './usecases';

const db = new Database({ url: 'http://arango:8529', databaseName: 'ocean' });
const config = {
  db,
  collectionNames: {
    authors: 'authors',
    users: 'users',
    documents: 'documents',
    documentLinks: 'documentLinks'
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

const links = new ArangoDocumentLinkRepository(documents, config);
await links.initialize();

const analysis = new DefaultAnalysisManager(defaultAnalyzers);
const migrations = new DefaultMigrationManager(defaultMigrations);
const importer = new WebContentImporter();

// Create and start the server
const app = new OceanServer(users, authors, documents, 'secret', analysis, links, migrations, importer);
app.listen(3000);//