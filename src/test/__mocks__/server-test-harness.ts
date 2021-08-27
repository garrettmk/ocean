import { DocumentsGraphQLClient, GraphQLClient, UrqlGraphQLClient } from "@/client/interfaces";
import { AuthorRepository, DocumentRepository, Document, DocumentHeader } from "@/domain";
import { MemoryAuthorRepository, MemoryDocumentRepository, MemoryUserRepository } from "@/server/interfaces";
import { OceanServer } from "@/server/ocean-server";
import { User, UserRepository } from "@/server/usecases";
import { TestAuthenticator } from "./test-authenticator";
import fetch from "node-fetch";


export class ServerTestHarness {
  public authorRepo: AuthorRepository;
  public userRepo: UserRepository;
  public documentRepo: DocumentRepository;
  public server: OceanServer;

  public authenticator: TestAuthenticator;
  public graphql: GraphQLClient;
  public documentsApi: DocumentsGraphQLClient;

  public users: User[] = [];
  public docs: Document[] = [];

  public invalidUserId = 'vader';
  public invalidDocumentId = '9999999';


  constructor() {
    this.authorRepo = new MemoryAuthorRepository();
    this.userRepo = new MemoryUserRepository(this.authorRepo);
    this.documentRepo = new MemoryDocumentRepository(this.authorRepo);
    this.server = new OceanServer(this.userRepo, this.documentRepo, 'secret');

    this.authenticator = new TestAuthenticator(undefined, 'secret');
    this.graphql = new UrqlGraphQLClient('http://127.0.0.1:3000/graphql', this.authenticator, fetch as any);
    this.documentsApi = new DocumentsGraphQLClient(this.graphql);
  }


  async populate() {
    const names = ['Luke', 'Leia', 'Han', 'Chewie'];

    this.users = await Promise.all(
      names.map(async name => await this.userRepo.save({
        id: name.toLowerCase(),
        name,
      }))
    );

    this.docs = await Promise.all(this.users.flatMap(user => 
      ['Title 1', 'Title 2', 'Title 3'].map(title =>
        this.documentRepo.create(user.author.id, {
          isPublic: user.author.name === 'Chewie',
          title: title
        })
      )
    ));
  }


  async getUserDocumentsHeaders(id: string) : Promise<DocumentHeader[]> {
    if (!this.docs)
      throw Error('You need to call populate');

    const user = await this.userRepo.getById(id);
    return this.docs
      .filter(doc => doc.author.id === user.author.id)
      .map(({ content, ...header }) => header);
  }


  async getPublicDocuments() : Promise<DocumentHeader[]> {
    if (!this.docs)
      throw new Error('Not populated yet');

    return this.docs
      .filter(doc => doc.isPublic)
      .map(({ content, ...header }) => header);
  }
}