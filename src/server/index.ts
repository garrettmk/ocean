import { DefaultAnalysisManager, DefaultMigrationManager, defaultAnalyzers, defaultMigrations } from '@/content';
import { AlreadyExistsError } from '@/domain';
import { ArangoAuthorRepository, ArangoDocumentLinkRepository, ArangoDocumentRepository, ArangoUserRepository } from '@/server/repositories';
import { OceanServer } from './ocean-server';
import { makeArangoConnection } from '@/server/utils';
import { arangoConnectionConfig, arangoCollectionNames, serverConfig } from '@/server/config';
export { AuthorizationError } from '@/server/usecases';


// Connect to the database
const db = await makeArangoConnection(arangoConnectionConfig);
const config = { db, collectionNames: arangoCollectionNames };

// Create the repositories
const authors = new ArangoAuthorRepository(config);
await authors.initialize();

const users = new ArangoUserRepository(authors, config);
await users.initialize();

const documents = new ArangoDocumentRepository(authors, config);
await documents.initialize();

const documentLinks = new ArangoDocumentLinkRepository(documents, config);
await documentLinks.initialize();

// Other dependencies
const analysis = new DefaultAnalysisManager(defaultAnalyzers);
const migrations = new DefaultMigrationManager(defaultMigrations);

// Create and start the server
const app = new OceanServer({
  ...serverConfig,
  users, 
  authors, 
  documents, 
  analysis,
  documentLinks,
  migrations
});

await app.listen();
console.log(`Listening on port ${serverConfig.port}`);


// Create a user here to make dev easier
try {
  const author = await authors.create({ name: 'Luke S.' });
  const user = await users.create('lukeskywalker', { name: 'Luke Skywalker', author });
} catch (error) {
  if (!(error instanceof AlreadyExistsError))
    throw error;
}
