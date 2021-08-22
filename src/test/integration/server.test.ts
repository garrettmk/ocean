import { DocumentsGraphQLClient, UrqlGraphQLClient } from "@/client/interfaces";
import { OceanServer } from "@/server/app"
import { MemoryAuthorRepository, MemoryDocumentRepository, MemoryUserRepository } from "@/server/interfaces";
import fetch from 'node-fetch';
import { AuthorRepository, DocumentRepository, Document, DocumentHeader } from "@/domain";
import { UserRepository } from "@/server/usecases";
import jwt from 'jwt-simple';


describe('Testing OceanServer', () => {
  let authors: AuthorRepository;
  let users: UserRepository;
  let documents: DocumentRepository;
  let server: OceanServer;
  let api: DocumentsGraphQLClient;


  async function populate() : Promise<Document[]> {
    const names = ['Luke', 'Leia', 'Han', 'Chewie'];

    const usrs = await Promise.all(
      names.map(async name => await users.save({
        id: name.toLowerCase(),
        name,
      }))
    );

    const docs = Promise.all(usrs.flatMap(user => 
      ['Title 1', 'Title 2', 'Title 3'].map(title =>
        documents.create({
          authorId: user.author.id,
          isPublic: user.author.name === 'Chewie',
          title: title
        })
      )
    ));

    return docs;
  }


  beforeEach(() => {
    authors = new MemoryAuthorRepository();
    documents = new MemoryDocumentRepository(authors);
    users = new MemoryUserRepository(authors);
    
    server = new OceanServer(users, documents);
    server.listen(3000);

    const tokenGetter = async () => jwt.encode({
      sub: 'luke'
    }, 'secret');

    const graphqlClient = new UrqlGraphQLClient('http://127.0.0.1:3000/graphql', fetch, tokenGetter);
    api = new DocumentsGraphQLClient(graphqlClient);
  });


  afterEach(() => {
    server.close();
  });


  it('should only return headers from the given author', async () => {
    expect.assertions(1);
    const docs = await populate();
    const expected: DocumentHeader[] = docs
      .filter(doc => doc.author.name == 'Luke')
      .map(({ content, ...header }) => header);

    const result = await api.listDocuments();
    expect(result).toMatchObject(expected);
    // expect(api.listDocuments()).resolves.toMatchObject(expected);
  })
})