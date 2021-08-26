import { DocumentsGraphQLClient, GraphQLClient, UrqlGraphQLClient } from "@/client/interfaces";
import { AuthorRepository, DocumentRepository, Document, DocumentHeader } from "@/domain";
import { MemoryAuthorRepository, MemoryDocumentRepository, MemoryUserRepository } from "@/server/interfaces";
import { OceanServer } from "@/server/ocean-server";
import { UserRepository } from "@/server/usecases";
import { TestAuthenticator } from "./test-authenticator";
import fetch from "node-fetch";


export class ServerTestHarness {
  public authors: AuthorRepository;
  public users: UserRepository;
  public documents: DocumentRepository;
  public server: OceanServer;

  public authenticator: TestAuthenticator;
  public graphql: GraphQLClient;
  public documentsApi: DocumentsGraphQLClient;

  public docs: Document[] = [];


  constructor() {
    this.authors = new MemoryAuthorRepository();
    this.users = new MemoryUserRepository(this.authors);
    this.documents = new MemoryDocumentRepository(this.authors);
    this.server = new OceanServer(this.users, this.documents, 'secret');

    this.authenticator = new TestAuthenticator(undefined, 'secret');
    this.graphql = new UrqlGraphQLClient('http://127.0.0.1:3000/graphql', this.authenticator, fetch as any);
    this.documentsApi = new DocumentsGraphQLClient(this.graphql);
  }


  async populate() {
    const names = ['Luke', 'Leia', 'Han', 'Chewie'];

    const usrs = await Promise.all(
      names.map(async name => await this.users.save({
        id: name.toLowerCase(),
        name,
      }))
    );

    this.docs = await Promise.all(usrs.flatMap(user => 
      ['Title 1', 'Title 2', 'Title 3'].map(title =>
        this.documents.create(user.author.id, {
          isPublic: user.author.name === 'Chewie',
          title: title
        })
      )
    ));
  }


  async getUserDocumentsHeaders(id: string) : Promise<DocumentHeader[]> {
    if (!this.docs)
      throw Error('You need to call populate');

    const user = await this.users.getById(id);
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