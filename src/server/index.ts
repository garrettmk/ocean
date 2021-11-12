import { DefaultAnalysisManager, DefaultMigrationManager, defaultAnalyzers, defaultMigrations } from '@/content';
import { AlreadyExistsError } from '@/domain';
import { ArangoAuthorRepository, ArangoDocumentLinkRepository, ArangoDocumentRepository, ArangoUserRepository, WebContentImporter } from './interfaces';
import { OceanServer } from './ocean-server';
import { makeArangoConnection } from './utils';
import { arangoConnectionConfig, arangoCollectionNames } from './config';
export { AuthorizationError } from './usecases';


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

const links = new ArangoDocumentLinkRepository(documents, config);
await links.initialize();

// Other dependencies
const analysis = new DefaultAnalysisManager(defaultAnalyzers);
const migrations = new DefaultMigrationManager(defaultMigrations);
const importer = new WebContentImporter();

// Create and start the server
const app = new OceanServer(users, authors, documents, 'secret', analysis, links, migrations, importer);
app.listen();


// Create a user here to make dev easier
try {
  const author = await authors.create({ name: 'Luke S.' });
  const user = await users.create('lukeskywalker', { name: 'Luke Skywalker', author });
} catch (error) {
  if (!(error instanceof AlreadyExistsError))
    throw error;
}
