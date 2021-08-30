import { OceanServer } from './ocean-server';
import { MemoryAuthorRepository, MemoryDocumentRepository, MemoryUserRepository } from "./interfaces";
export { AuthorizationError } from './usecases';


// Create repositories
const authors = new MemoryAuthorRepository();
const documents = new MemoryDocumentRepository(authors);
const users = new MemoryUserRepository(authors);

// For dev purposes, add a single, default user
users.save({
  id: 'SINGLE_USER',
  name: 'Single User'
});

const app = new OceanServer(users, documents, 'secret');
app.listen(3000);