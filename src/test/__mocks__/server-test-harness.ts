import { DocumentsGraphQLClient, GraphQLClient, UrqlGraphQLClient } from "@/client/interfaces";
import { AuthorRepository, DocumentRepository, Document, DocumentHeader, DocumentLinkRepository } from "@/domain";
import { MemoryAuthorRepository, MemoryDocumentLinkRepository, MemoryDocumentRepository, MemoryUserRepository } from "@/server/interfaces";
import { OceanServer } from "@/server/ocean-server";
import { User, UserRepository } from "@/server/usecases";
import { TestAuthenticator } from "./test-authenticator";
import fetch from "node-fetch";
import { ContentAnalysisManager, DefaultAnalysisManager, defaultAnalyzers } from "@/documents";


export class ServerTestHarness {
  public authorRepo: AuthorRepository;
  public userRepo: UserRepository;
  public documentRepo: DocumentRepository;
  public linkRepo: DocumentLinkRepository;
  public analysis: ContentAnalysisManager;
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
    this.userRepo = new MemoryUserRepository();
    this.documentRepo = new MemoryDocumentRepository(this.authorRepo);
    this.linkRepo = new MemoryDocumentLinkRepository();
    this.analysis = new DefaultAnalysisManager(defaultAnalyzers);

    this.server = new OceanServer(this.userRepo, this.authorRepo, this.documentRepo, 'secret', this.analysis, this.linkRepo);

    this.authenticator = new TestAuthenticator(undefined, 'secret');
    this.graphql = new UrqlGraphQLClient('http://127.0.0.1:3000/graphql', this.authenticator, fetch as any);
    this.documentsApi = new DocumentsGraphQLClient(this.graphql);
  }


  async populate() {
    const names = ['Luke', 'Leia', 'Han', 'Chewie'];

    this.users = await Promise.all(
      names.map(async name => {
        const author = await this.authorRepo.create({ name });
        return await this.userRepo.create(name.toLowerCase(), { name, author });
      })
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