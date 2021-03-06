import { GraphQLClient } from "@/client/interfaces";
import { UrqlGraphQLClient, DocumentsGraphQLClient } from "@/client/implementations";
import { AuthorRepository, DocumentRepository, Document, DocumentHeader, DocumentLinkRepository, ContentAnalysisManager, ContentMigrationManager } from "@/domain";
import { MemoryAuthorRepository, MemoryDocumentLinkRepository, MemoryDocumentRepository, MemoryUserRepository } from "@/server/repositories";
import { OceanServer } from "@/server/ocean-server";
import { User, UserRepository } from "@/server/usecases";
import { TestAuthenticator } from "./test-authenticator";
import fetch from "node-fetch";
import { DefaultAnalysisManager, defaultAnalyzers, DefaultMigrationManager, defaultMigrations } from "@/content";
import { TestWebContentImporter } from "./test-web-content-importer";


export class ServerTestHarness {
  public authorRepo: AuthorRepository;
  public userRepo: UserRepository;
  public documentRepo: DocumentRepository;
  public linkRepo: DocumentLinkRepository;
  public analysis: ContentAnalysisManager;
  public migrations: ContentMigrationManager;
  public importer: TestWebContentImporter;
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
    this.migrations = new DefaultMigrationManager(defaultMigrations);
    this.importer = new TestWebContentImporter();
    

    this.server = new OceanServer({
      users: this.userRepo, 
      authors: this.authorRepo, 
      documents: this.documentRepo, 
      secret: 'secret', 
      analysis: this.analysis, 
      documentLinks: this.linkRepo,
      migrations: this.migrations,
      port: 3000
    });

    this.authenticator = new TestAuthenticator(undefined, 'secret');
    this.graphql = new UrqlGraphQLClient({
      url: 'http://127.0.0.1:3000/graphql', 
      authenticator: this.authenticator, 
      fetch: fetch as any
    });
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