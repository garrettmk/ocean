import { ContentAnalysisManager, Document, DocumentGraph, DocumentHeader, DocumentLink, DocumentLinkRepository, DocumentRepository, ID, JSONSerializable } from "@/domain";
import { WebContentImporter } from "../interfaces/web-content-importer";
import { AuthorizationError } from "./server-errors";
import { UserRepository } from './server-user-models';


export class ServerDocumentInteractor {
  private documents: DocumentRepository;
  private users: UserRepository;
  private analysis: ContentAnalysisManager;
  private links: DocumentLinkRepository;
  private importer: WebContentImporter;


  constructor(documents: DocumentRepository, users: UserRepository, analysis: ContentAnalysisManager, links: DocumentLinkRepository) {
    this.documents = documents;
    this.users = users;
    this.analysis = analysis; 
    this.links = links;
    this.importer = new WebContentImporter();
  }


  async createDocument(userId: ID, input: CreateDocumentInput) : Promise<Document> {
    const user = await this.users.getById(userId);
    const doc = await this.documents.create(user.author.id, input);

    return doc;
  }


  async listDocuments(userId?: ID) : Promise<DocumentHeader[]> {
    const user = userId && await this.users.getById(userId);
    if (user)
      return await this.documents.query({ authorId: [user.author.id] });
    else
      return await this.documents.query({ isPublic: true });
  }


  async updateDocument(userId: ID, documentId: ID, input: UpdateDocumentInput) {
    const user = await this.users.getById(userId);
    const document = await this.documents.getById(documentId);
    const isUpdatePermitted =
      user &&
      document &&
      user.author.id === document.author.id;

    if (!isUpdatePermitted)
      throw new AuthorizationError('Only the document author can make changes');
    
    const newDocument = await this.documents.update(documentId, input);
    return newDocument;
  }


  async getDocument(userId: ID | undefined, documentId: ID) : Promise<Document> {
    const user = userId && await this.users.getById(userId);
    const document = await this.documents.getById(documentId);
    const isViewPermitted = (document.isPublic) || (user && user.author.id === document.author.id);

    if (!isViewPermitted)
      throw new AuthorizationError('Only the document author can view this document');

    return document;
  }


  async deleteDocument(userId: ID, documentId: ID) : Promise<Document> {
    const user = await this.users.getById(userId);
    const document = await this.documents.getById(documentId);
    const isDeletePermitted = document.author.id === user.author.id;

    if (!isDeletePermitted)
      throw new AuthorizationError('Only the document author can delete a document');

    await this.documents.delete(document.id);

    return document;
  }


  async getDocumentGraph(userId: ID, documentId: ID, depth: number = 1) : Promise<DocumentGraph> {
    const user = await this.users.getById(userId);
    const document = await this.documents.getById(documentId);
    const isGetGraphPermitted = 
      document.author.id === user.author.id ||
      document.isPublic;

    if (!isGetGraphPermitted)
      throw new AuthorizationError('You don\'t have permission to view this graph');

    const recursivelyGetLinks: (id: ID, alreadyVisited?: DocumentLink[]) => Promise<DocumentLink[]> = async (id: ID, alreadyVisited: DocumentLink[] = []) => {
      const links = await this.links.listLinks(id);
      const linksToVisit = links.filter(link => !alreadyVisited.find(l2 => l2.from === link.from && l2.to === link.to));
      const nextAlreadyVisited = [...alreadyVisited, ...linksToVisit];
      const linkedIds = linksToVisit.flatMap(link => [link.from, link.to]).filter(id2 => id2 !== id);
      const linksFromLinkedIds = (await Promise.all(linkedIds.map(linkedId => recursivelyGetLinks(linkedId, nextAlreadyVisited)))).flat();

      return [...linksToVisit, ...linksFromLinkedIds];
    };

    const links = await recursivelyGetLinks(documentId);
    const documentIds = [documentId, ...links.map(link => link.from), ...links.map(link => link.to)];
    const documents = await this.documents.query({ id: documentIds });
    
    return { documents, links };
  }
  

  async getRecommendedLinks(userId: ID, documentId: ID) : Promise<DocumentGraph> {
    const user = await this.users.getById(userId);
    const document = await this.documents.getById(documentId);
    const { content, ...documentHeader } = document;

    const canRead = document.author.id === user.author.id || document.isPublic;
    if (!canRead)
      throw new AuthorizationError(`user ${userId} is not authorized to read document ${documentId}`);
    
    const { links = [] } = await this.analysis.analyze(document.contentType, document.content);
    const linkedIds: ID[] = links
      .map(link => link.url.match(/^\/doc\/(.+)/))
      .filter(matches => matches?.[1])
      .map(matches => matches![1]);

    const linkedDocuments = await this.documents.query({ id: linkedIds });

    const graph: DocumentGraph = {
      documents: [documentHeader, ...linkedDocuments],
      links: linkedDocuments.map(({ id }) => ({
        from: document.id,
        to: id,
        meta: {}
      }))
    };

    return graph;
  }


  async linkDocuments(userId: ID, fromId: ID, toId: ID, meta?: Record<string, JSONSerializable>) : Promise<DocumentLink> {
    const user = await this.users.getById(userId);
    const fromDoc = await this.documents.getById(fromId);
    const toDoc = await this.documents.getById(toId);

    const canLink = 
      fromDoc.author.id === user.author.id &&
      (toDoc.author.id === user.author.id || toDoc.isPublic);
    if (!canLink)
      throw new AuthorizationError(`User does not have permission to link these documents`);

    const link = await this.links.link(fromId, toId, meta);

    return link;
  }


  async unlinkDocuments(userId: ID, fromId: ID, toId: ID) : Promise<DocumentLink> {
    const user = await this.users.getById(userId);
    const fromDoc = await this.documents.getById(fromId);
    const toDoc = await this.documents.getById(toId);

    const canUnlink = 
      fromDoc.author.id === user.author.id &&
      (toDoc.author.id === user.author.id || toDoc.isPublic);
    if (!canUnlink)
      throw new AuthorizationError(`User does not have permission to unlink these documents`);

    const link = await this.links.unlink(fromId, toId);

    return link;
  }


  async importDocumentFromUrl(userId: ID, url: string) : Promise<Document> {
    const user = await this.users.getById(userId);
    const imported = await this.importer.importContent(url);
    const document = await this.documents.create(user.author.id, {
      title: imported.title ?? url,
      contentType: 'text/html',
      content: imported.content
    });

    return document;
  }
}


type CreateTitleInput = {
  title?: string,
  isPublic?: boolean
}

type CreateContentInput = {
  contentType: string,
  content: any
}

export type CreateDocumentInput = CreateTitleInput | CreateContentInput | (CreateTitleInput & CreateContentInput);
export type UpdateDocumentInput = CreateTitleInput | CreateContentInput | (CreateTitleInput & CreateContentInput);
