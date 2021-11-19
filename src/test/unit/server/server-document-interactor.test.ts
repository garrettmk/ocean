import { DefaultAnalysisManager, defaultAnalyzers, DefaultMigrationManager, defaultMigrations } from "@/content";
import { AlreadyExistsError, AuthorRepository, ContentAnalysisManager, ContentMigrationManager, Document, DocumentLink, DocumentLinkRepository, DocumentRepository, NotFoundError, NotImplementedError, UpdateDocumentInput, validateContentType, validateDocument, validateDocumentGraph, ValidationError } from "@/domain";
import { ImportedWebContent } from "@/server/content-loaders/web-content-importer";
import { TestWebContentImporter } from "@/test/__utils__/test-web-content-importer";
import { MemoryAuthorRepository, MemoryDocumentLinkRepository, MemoryDocumentRepository, MemoryUserRepository } from "@/server/repositories";
import { CreateDocumentInput, ServerDocumentInteractor, User, UserRepository } from "../../../server/usecases";
import { AuthorizationError } from "../../../server/usecases/server-errors";
import * as INVALID from '../../__utils__/domain-invalid-examples';
import * as VALID from '../../__utils__/domain-valid-examples';
import { TestPromise } from '../../__utils__/test-promise';



describe.skip('Testing ServerDocumentInteractor', () => {
  let interactor: ServerDocumentInteractor;
  let documents: DocumentRepository;
  let users: UserRepository;
  let authors: AuthorRepository;
  let analysis: ContentAnalysisManager;
  let links: DocumentLinkRepository;
  let migrations: ContentMigrationManager;
  let importer: TestWebContentImporter;

  beforeEach(() => {
    authors = new MemoryAuthorRepository();
    users = new MemoryUserRepository();
    documents = new MemoryDocumentRepository(authors);
    analysis = new DefaultAnalysisManager(defaultAnalyzers);
    links = new MemoryDocumentLinkRepository();
    migrations = new DefaultMigrationManager(defaultMigrations);
    importer = new TestWebContentImporter();
    interactor = new ServerDocumentInteractor({ documents, users, analysis, links, migrations });
  });


  async function populate() : Promise<Document[]> {
    const names = ['Luke', 'Leia', 'Han', 'Chewie'];

    const usrs = await Promise.all(
      names.map(async name => await users.create(name.toLowerCase(), {
        name,
        author: await authors.create({ name })
      }))
    );

    const docs = Promise.all(usrs.flatMap(user => 
      ['Title 1', 'Title 2', 'Title 3'].map(title =>
        documents.create(user.author.id, {
          isPublic: user.author.name === 'Chewie',
          title: title
        })
      )
    ));

    return docs;
  }

  describe('Testing createDocument()', () => {
    let user: User;
    let input: CreateDocumentInput;

    beforeEach(async () =>{
      const author = await authors.create({ name: 'username' });
      user = await users.create('user-id', { name: 'username', author });
      input = {};
    });

    it('should create and return a new document', async () => {
      expect.assertions(3);
      const doc = await interactor.createDocument(user.id, input);
  
      expect(() => validateDocument(doc)).not.toThrow();
      await expect(documents.getById(doc.id)).resolves.toMatchObject(doc);
      expect(doc.author.id).toBe(user.author.id);
    });
  
  
    it('should throw NotFoundError given an invalid userId', async () => {
      expect.assertions(1);
      await expect(interactor.createDocument('vader', input)).rejects.toBeInstanceOf(NotFoundError);
    });
  
  
    it('should throw ValidationError if given an invalid input', async () => {
      expect.assertions(1);
      const input = { title: 123 } as unknown as CreateDocumentInput;
  
      await expect(interactor.createDocument(user.id, input)).rejects.toBeInstanceOf(ValidationError);
    });
  });


  describe('Testing listDocuments()', () => {
    it('should return all public documents', async () => {
      expect.assertions(1);
      const docs = await populate();
      const publicDocs = docs.filter(doc => doc.isPublic);
      const expected = publicDocs.map(({ content, ...header }) => header);
  
      await expect(interactor.listDocuments()).resolves.toMatchObject(expected);
    });
  
  
    it('should return all documents with a matching author', async () => {
      expect.assertions(1);
      const docs = await populate();
      const authorDocs = docs.filter(doc => doc.author.name === 'Luke');
      const expected = authorDocs.map(({ content, ...header }) => header);
  
      await expect(interactor.listDocuments('luke')).resolves.toMatchObject(expected);
    });
  
  
    it('should throw NotFoundError if given a non-existent user id', async () => {
      expect.assertions(1);
      const docs = await populate();
  
      await expect(interactor.listDocuments('vader')).rejects.toBeInstanceOf(NotFoundError);
    });
  });


  describe('Testing updateDocument()', () => {
    let docs: Document[];
    let document: Document;
    let input: UpdateDocumentInput = { title: 'The Empire Strikes Back' };
    let expected: Document;


    beforeEach(async () => {
      docs = await populate();
      document = docs[0];
      expected = { ...document, ...input };
    });


    it('should return the updated document', async () => {
      expect.assertions(1);
      await expect(interactor.updateDocument('luke', document.id, input )).resolves.toMatchObject(expected);
    });


    it('should save the updated document in the repository', async () => {
      expect.assertions(1);

      await interactor.updateDocument('luke', document.id, input);
      
      await expect(documents.getById(document.id)).resolves.toMatchObject(expected);
    });


    it('should throw NotFoundError if given a non-existent Author id', async () => {
      expect.assertions(1);
      await expect(interactor.updateDocument('vader', document.id, input)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw NotFoundError if given a non-existent document id', async () => {
      expect.assertions(1);
      await expect(interactor.updateDocument('luke', 'rawr', input)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw AuthorizationError if the user is not the document author', async () => {
      expect.assertions(1);
      await expect(interactor.updateDocument('leia', document.id, input)).rejects.toBeInstanceOf(AuthorizationError);
    });


    it('should throw ValidationError if the input is invalid', async () => {
      expect.assertions(1);
      const invalidInput = { title: 123 } as unknown as UpdateDocumentInput;
      await expect(interactor.updateDocument('luke', document.id, invalidInput)).rejects.toBeInstanceOf(ValidationError);
    });
  });


  describe('Testing getDocument()', () => {
    let docs: Document[];

    beforeEach(async () => {
      docs = await populate();
    });


    it('should return a valid document', async () => {
      expect.assertions(1);
      const document = docs[0];
      await expect(interactor.getDocument('luke', document.id)).resolves.toMatchObject(document);
    });

    
    it('should return a public document even if no user id is given', async () => {
      expect.assertions(1);
      const document = docs.find(doc => doc.isPublic) as Document;
      await expect(interactor.getDocument(undefined, document.id)).resolves.toMatchObject(document);
    });


    it('should throw NotFoundError if given a nonexistent user id', async () => {
      expect.assertions(1);
      await expect(interactor.getDocument('vader', docs[0].id)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw AuthorizationError if the document is not public and the user is not the author', async () => {
      expect.assertions(1);
      const document = docs.find(doc => doc.isPublic === false) as Document;
      await expect(interactor.getDocument('leia', document.id)).rejects.toBeInstanceOf(AuthorizationError);
    });
  });


  describe('testing deleteDocument', () => {
    let docs: Document[];

    beforeEach(async () => {
      docs = await populate();
    });


    it('should delete the document', async () => {
      expect.assertions(2);
      const document = docs[0];

      await expect(interactor.deleteDocument('luke', document.id)).resolves.toMatchObject(document);
      await expect(documents.getById(document.id)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw NotFoundError if the user can\'t be found', async () => {
      expect.assertions(1);
      const document = docs[0];

      await expect(interactor.deleteDocument('vader', document.id)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw NotFoundError if the document can\'t be found', async () => {
      expect.assertions(1);
      
      await expect(interactor.deleteDocument('luke', 'lkjlkj')).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw AuthorizationError if the user is not the document author', async () => {
      expect.assertions(1);
      const document = docs[0];

      await expect(interactor.deleteDocument('leia', document.id)).rejects.toBeInstanceOf(AuthorizationError);
    })
  });

  describe('Testing getRecommendedLinks', () => {
    let docs: Document[];

    beforeEach(async () => {
      docs = await populate();
    });

    it('should return a valid DocumentGraph', async () => {
      expect.assertions(1);

      const result = await interactor.getRecommendedLinks('luke', docs[0].id)
      expect(() => validateDocumentGraph(result)).not.toThrow();
    });

    it('should return a graph where every link is either to or from the requested document', async () => {
      const documentId = docs[0].id;
      const graph = await interactor.getRecommendedLinks('luke', documentId);
      expect.assertions(graph.links.length);

      graph.links.forEach(link => {
        expect(link.from === documentId || link.to === documentId).toBeTruthy();
      });
    });

    it('should throw AuthorizationError if the user is not authorized to view the document', async () => {
      expect.assertions(1);
      const unauthorizedUser = 'leia';

      await expect(() => interactor.getRecommendedLinks(unauthorizedUser, docs[0].id)).rejects.toBeInstanceOf(AuthorizationError);
    });

    it('should only return links to documents the user can read', async () => {
      const graph = await interactor.getRecommendedLinks('luke', docs[0].id);
      expect.assertions(graph.documents.length);

      graph.documents.forEach(doc => {
        expect(() => interactor.getDocument('luke', doc.id)).not.toThrow();
      });
    });

    it('should throw NotFoundError if the document does not exist', async () => {
      expect.assertions(1);

      await expect(() => interactor.getRecommendedLinks('luke', 'nonexistent')).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw NotFoundError if the user does not exist', async () => {
      expect.assertions(1);

      await expect(() => interactor.getRecommendedLinks('vader', docs[0].id)).rejects.toBeInstanceOf(NotFoundError);
    });
  });


  describe('Testing linkDocuments()', () => {
    let docs: Document[];

    beforeEach(async () => {
      docs = await populate();
    });

    it('should return a link matching the given parameters', async () => {
      expect.assertions(1);
      const fromId = docs[0].id;
      const toId = docs[1].id;
      const meta = VALID.DOCUMENT_LINK_METAS[0];
      const expected: DocumentLink = { from: fromId, to: toId, meta };

      await expect(interactor.linkDocuments('luke', fromId, toId, meta)).resolves.toMatchObject(expected);
    });

    it('should throw NotFoundError if the user does not exist', async () => {
      expect.assertions(1);

      await expect(interactor.linkDocuments('vader', docs[0].id, docs[1].id)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw NotFoundError if the from document does not exist', async () => {
      expect.assertions(1);
      await expect(interactor.linkDocuments('luke', 'nonexistent', docs[0].id)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw NotFoundError if the to document does not exist', async () => {
      expect.assertions(1);
      await expect(interactor.linkDocuments('luke', docs[0].id, 'nonexistent')).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw AuthorizationError if the user does not have access to the from document', async () => {
      expect.assertions(1);
      await expect(interactor.linkDocuments('luke', docs[4].id, docs[0].id)).rejects.toBeInstanceOf(AuthorizationError);
    });

    it('should throw AuthorizationError if the user does not have access to the to document', async () => {
      expect.assertions(1);
      await expect(interactor.linkDocuments('luke', docs[0].id, docs[5].id)).rejects.toBeInstanceOf(AuthorizationError);
    });

    it('should throw ValidationError if "meta" is invalid', async () => {
      expect.assertions(1);
      await expect(interactor.linkDocuments('luke', docs[0].id, docs[1].id, INVALID.OPTIONAL_DOCUMENT_LINK_METAS[0])).rejects.toBeInstanceOf(ValidationError);
    });

    it('should throw AlreadyExistsError if a link already exists between the two documents', async () => {
      expect.assertions(1);
      const fromId = docs[0].id;
      const toId = docs[1].id;

      await interactor.linkDocuments('luke', fromId, toId);
      await expect(interactor.linkDocuments('luke', fromId, toId)).rejects.toBeInstanceOf(AlreadyExistsError);
    });

  });

  
  describe('Testing unlinkDocuments()', () => {
    let docs: Document[];
    let link: DocumentLink;

    beforeEach(async () => {
      docs = await populate();
      link = await interactor.linkDocuments('luke', docs[0].id, docs[1].id);
    });

    it('should delete and return the link matching the given parameters', async () => {
      expect.assertions(1);
      
      await expect(interactor.unlinkDocuments('luke', link.from, link.to)).resolves.toMatchObject(link);
    });

    it('should throw NotFoundError if the user does not exist', async () => {
      expect.assertions(1);

      await expect(interactor.unlinkDocuments('vader', link.from, link.to)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw NotFoundError if the matching link cannot be found', async () => {
      expect.assertions(1);

      await expect(interactor.unlinkDocuments('luke', docs[1].id, docs[2].id)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw AuthorizationError if the user does not have access to the documents', async () => {
      expect.assertions(1);

      await expect(interactor.unlinkDocuments('leia', link.from, link.to)).rejects.toBeInstanceOf(AuthorizationError);
    });
  });


  describe('Testing importDocumentFromUrl()', () => {

    it('should have written tests', () => {
      throw new NotImplementedError();
    });
  });


  describe('Testing graphByQuery()', () => {
    let docs: Document[];

    beforeEach(async () => {
      docs = await populate();
    });

    it.each(VALID.DOCUMENT_GRAPH_QUERIES)('should return a valid DocumentGraph', async query => {
      expect.assertions(1);

      const result = await interactor.graphByQuery('luke', query);

      expect(() => validateDocumentGraph(result)).not.toThrow();
    });

    it.each(INVALID.DOCUMENT_GRAPH_QUERIES)('should throw ValidationError if given an invalid query', async (query) => {
      expect.assertions(1);

      await expect(interactor.graphByQuery('luke', query)).rejects.toBeInstanceOf(ValidationError);
    });

    it('should throw NotFoundError if the user does not exist', async () => {
      expect.assertions(1);

      await expect(interactor.graphByQuery('vader', {})).rejects.toBeInstanceOf(NotFoundError);
    });
  });


  describe('Testing listContentConversions()', () => {
    it.each(VALID.CONTENT_TYPES)('should return a list of contentType strings when given %p', async (contentType) => {
      const result = await interactor.listContentConversions(contentType);
      result.forEach(element => expect(() => validateContentType(element)).not.toThrow());
    });

    it.each(INVALID.CONTENT_TYPES)('should throw ValidationError if given %p', async (value) => {
      expect.assertions(1);
      
      await expect(interactor.listContentConversions(value)).rejects.toBeInstanceOf(ValidationError);
    });
  });


  describe('Testing convertContent()', () => {
    it('should have written tests', () => {
      throw new NotImplementedError();
    });
  });
});