import { ClientAuthenticator, DocumentsGraphQLClient, UrqlGraphQLClient } from "@/client/interfaces";
import { OceanServer } from "@/server/ocean-server"
import { MemoryAuthorRepository, MemoryDocumentRepository, MemoryUserRepository } from "@/server/interfaces";
import fetch from 'node-fetch';
import { AuthorRepository, DocumentRepository, Document, DocumentHeader, NotFoundError } from "@/domain";
import { UserRepository } from "@/server/usecases";
import { TestAuthenticator } from "../__mocks__/TestAuthenticator";


describe('Testing OceanServer', () => {
  let authors: AuthorRepository;
  let users: UserRepository;
  let documents: DocumentRepository;
  let server: OceanServer;
  let api: DocumentsGraphQLClient;
  let authenticator: TestAuthenticator;


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
    
    server = new OceanServer(users, documents, 'secret');
    server.listen(3000);

    authenticator = new TestAuthenticator();
    const graphqlClient = new UrqlGraphQLClient('http://127.0.0.1:3000/graphql', authenticator, fetch as any);
    
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
    
    authenticator.useUserId('luke');    

    await expect(api.listDocuments()).resolves.toMatchObject(expected);
  });

  
  it('should return only public documents if no user is logged in', async () => {
    expect.assertions(1);

    const docs = await populate();
    const expected: DocumentHeader[] = docs
      .filter(doc => doc.isPublic)
      .map(({ content, ...header }) => header);

    authenticator.useUserId(undefined);

    await expect(api.listDocuments()).resolves.toMatchObject(expected);
  });


  it('should throw an error if given an invalid user id', async () => {
    expect.assertions(1);

    const docs = await populate();

    authenticator.useUserId('vader');

    await expect(api.listDocuments()).rejects.toBeInstanceOf(Error)
  })
})