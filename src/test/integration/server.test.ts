import {
  NotFoundError,
  NotImplementedError,
  validateDocument,
  ValidationError,
  CreateDocumentInput,
  validateDocumentGraph,
  Document,
  DocumentLink,
  ID,
  AlreadyExistsError,
  validateContentType,
} from "@/domain";
import { AuthorizationError } from "@/client/interfaces";
import { UpdateDocumentInput, User } from "@/server/usecases";
import { ServerTestHarness } from "../__utils__/server-test-harness";
import * as VALID from "../__utils__/domain-valid-examples";
import * as INVALID from '..//__utils__/domain-invalid-examples';


describe('Testing OceanServer', () => {
  let harness: ServerTestHarness;


  beforeEach(async () => {
    harness = new ServerTestHarness();
    await harness.server.listen();
    await harness.populate();
  });


  afterEach(async () => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        harness.server.close();
        resolve();
      }, 50);
    });
  });


  describe('testing listDocuments()', () => {
    it('should only return headers from the given author', async () => {
      expect.assertions(1);
      const user = harness.users[0];

      const expected = await harness.getUserDocumentsHeaders(user.id);
      harness.authenticator.useUserId(user.id);
      
      await expect(harness.documentsApi.listDocuments()).resolves.toMatchObject(expected);
    });
  
    
    it('should return only public documents if no user is logged in', async () => {
      expect.assertions(1);
  
      const expected = await harness.getPublicDocuments();
      harness.authenticator.useUserId(undefined);
  
      await expect(harness.documentsApi.listDocuments()).resolves.toMatchObject(expected);
    });
  
  
    it('should throw an error if given an invalid user id', async () => {
      expect.assertions(1);
      harness.authenticator.useUserId(harness.invalidUserId);
  
      await expect(harness.documentsApi.listDocuments()).rejects.toBeInstanceOf(Error)
    });
  });


  describe('testing getDocument()', () => {
    it('should return the correct document', async () => {
      expect.assertions(1);

      const document = harness.docs[0];
      const user = await harness.userRepo.getByAuthorId(document.author.id);
      harness.authenticator.useUserId(user.id);

      await expect(harness.documentsApi.getDocument(document.id)).resolves.toMatchObject(document);
    });


    it('should throw NotFoundError if given an invalid document id', async () => {
      expect.assertions(1);
      const user = harness.users[0];
      harness.authenticator.useUserId(user.id);

      await expect(harness.documentsApi.getDocument(harness.invalidDocumentId)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw NotFoundError if given an invalid user id', async () => {
      expect.assertions(1);
      harness.authenticator.useUserId(harness.invalidUserId);
      const documentId = harness.docs[0].id;

      await expect(harness.documentsApi.getDocument(documentId)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw AuthorizationError if the document is not public and user is not the author', async () => {
      expect.assertions(3);
      const user = harness.users[1];
      const document = harness.docs[0];
      harness.authenticator.useUserId(user.id);

      expect(document.author.id).not.toEqual(user.author.id);
      expect(document.isPublic).not.toBeTruthy();
      await expect(harness.documentsApi.getDocument(document.id)).rejects.toBeInstanceOf(AuthorizationError);
    });
  });


  describe('testing createDocument()', () => {
    it('should create and return a new document', async () => {
      expect.assertions(2);
      const user = harness.users[0];
      harness.authenticator.useUserId(user.id);
      const input: CreateDocumentInput = {};

      const document = await harness.documentsApi.createDocument(input);

      expect(() => validateDocument(document)).not.toThrow();
      await expect(harness.documentRepo.getById(document.id)).resolves.toEqual(
        expect.objectContaining({ id: document.id })
      );
    });


    it('should throw NotFoundError if the user is not found', async () => {
      expect.assertions(1);
      harness.authenticator.useUserId(harness.invalidUserId);
      const input: CreateDocumentInput = {};

      await expect(harness.documentsApi.createDocument(input)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw ValidationError if given an invalid input', async () => {
      expect.assertions(1);
      const user = harness.users[0];
      harness.authenticator.useUserId(user.id);
      const input = { title: 123 } as unknown as CreateDocumentInput;

      await expect(harness.documentsApi.createDocument(input)).rejects.toBeInstanceOf(ValidationError);
    });
  });


  describe('testing updateDocument()', () => {
    it('should modify and return the document', async () => {
      expect.assertions(3);
      const user = harness.users[0];
      harness.authenticator.useUserId(user.id);
      const document = harness.docs[0];
      const input: UpdateDocumentInput = { title: 'A new title' };
      const expected = { ...document, ...input };

      expect(document.author).toMatchObject(user.author);
      expect(document).not.toMatchObject(expected);

      const received = await harness.documentsApi.updateDocument(document.id, input);

      expect(received).toMatchObject(expected);
    });


    it('should throw NotFoundError if the user can\'t be found', async () => {
      expect.assertions(1);
      harness.authenticator.useUserId(harness.invalidUserId);
      const document = harness.docs[0];
      const input: UpdateDocumentInput = { title: 'A new title' };

      await expect(harness.documentsApi.updateDocument(document.id, input)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw NotFoundError if the document can\'t be found', async () => {
      expect.assertions(1);
      const user = harness.users[0];
      harness.authenticator.useUserId(user.id);
      const input: UpdateDocumentInput = { title: 'New title' };

      await expect(harness.documentsApi.updateDocument(harness.invalidDocumentId, input)).rejects.toBeInstanceOf(NotFoundError);
    });
  });


  describe('testing deleteDocument()', () => {
    it('should delete the document', async () => {
      expect.assertions(1);
      const document = harness.docs[0];
      const user = await harness.userRepo.getByAuthorId(document.author.id);
      harness.authenticator.useUserId(user.id);

      await expect(harness.documentsApi.deleteDocument(document.id)).resolves.toMatchObject(document);
    });


    it('should throw NotFoundError if the user can\'t be found', async () => {
      expect.assertions(1);
      const document = harness.docs[0];
      harness.authenticator.useUserId(harness.invalidUserId);

      await expect(harness.documentsApi.deleteDocument(document.id)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw NotFoundError if the document can\'t be found', async () => {
      expect.assertions(1);
      const user = harness.users[0];
      harness.authenticator.useUserId(user.id);

      await expect(harness.documentsApi.deleteDocument(harness.invalidDocumentId)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw AuthorizationError if the user is not the documents author', async () => {
      expect.assertions(2);
      const document = harness.docs[0];
      const user = harness.users[1];
      harness.authenticator.useUserId(user.id);

      expect(document.author.id).not.toEqual(user.id);
      await expect(harness.documentsApi.deleteDocument(document.id)).rejects.toBeInstanceOf(AuthorizationError);
    });
  });

  describe('testing getRecommendedLinks()', () => {
    let document: Document;
    let user: User;

    beforeEach(async () => {
      document = harness.docs[0];
      user = await harness.userRepo.getByAuthorId(document.author.id);
      harness.authenticator.useUserId(user.id);
    })
    
    it('should return a valid DocumentGraph', async () => {
      expect.assertions(1);
      
      const result = await harness.documentsApi.getRecommendedLinks(document.id);
      expect(() => validateDocumentGraph(result)).not.toThrow();
    });

    it('should return a graph where every link is either to or from the given document', async () => {
      const graph = await harness.documentsApi.getRecommendedLinks(document.id);
      expect.assertions(graph.links.length);

      graph.links.forEach(link => {
        expect(link.from === document.id || link.to === document.id).toBeTruthy();
      });
    });

    it('should throw AuthorizationError if the user is not authorized to view the document', async () => {
      expect.assertions(2);
      const user = harness.users[1];
      harness.authenticator.useUserId(user.id);

      expect(user.author.id).not.toEqual(document.author.id);
      await expect(harness.documentsApi.getRecommendedLinks(document.id)).rejects.toBeInstanceOf(AuthorizationError);
    });

    it('should only return links to documents the user can read', async () => {
      const graph = await harness.documentsApi.getRecommendedLinks(document.id);
      expect.assertions(graph.documents.length);

      await Promise.all(graph.documents.map(async document => {
        return await expect(harness.documentRepo.getById(document.id)).resolves.toBeTruthy();
      }));
    });

    it('should throw NotFoundError if the document does not exist', async () => {
      expect.assertions(1);
      
      await expect(harness.documentsApi.getRecommendedLinks(harness.invalidDocumentId)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw NotFoundError if the user does not exist', async () => {
      expect.assertions(1);
      harness.authenticator.useUserId(harness.invalidUserId);

      await expect(harness.documentsApi.getRecommendedLinks(document.id)).rejects.toBeInstanceOf(NotFoundError);
    });
  });


  describe('testing linkDocuments()', () => {
    let from: ID;
    let to: ID;
    const meta = VALID.DOCUMENT_LINK_METAS[0];

    beforeEach(async () => {
      from = harness.docs[0].id;
      to = harness.docs[1].id;
      harness.authenticator.useUserId(harness.users[0].id);
    });

    it('should return a link matching the given inputs', async () => {
      expect.assertions(1);
      const expected: DocumentLink = { from, to, meta }

      await expect(harness.documentsApi.linkDocuments(from, to, meta)).resolves.toMatchObject(expected);
    });

    it('should throw NotFoundError if the user does not exist', async () => {
      expect.assertions(1);
      harness.authenticator.useUserId(harness.invalidUserId);

      await expect(harness.documentsApi.linkDocuments(from, to, meta)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw NotFoundError if the from document does not exist', async () => {
      expect.assertions(1);
      await expect(harness.documentsApi.linkDocuments(harness.invalidDocumentId, to, meta)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw NotFoundError if the to document does not exist', async () => {
      expect.assertions(1);
      await expect(harness.documentsApi.linkDocuments(from, harness.invalidDocumentId, meta)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw ValidationError if meta is invalid', async () => {
      expect.assertions(1);
      await expect(harness.documentsApi.linkDocuments(from, to, INVALID.OPTIONAL_DOCUMENT_LINK_METAS[0])).rejects.toBeInstanceOf(ValidationError);
    });

    it('should throw AuthorizationError if the user does not have access to the from document', async () => {
      expect.assertions(1);
      await expect(harness.documentsApi.linkDocuments(harness.docs[3].id, to, meta)).rejects.toBeInstanceOf(AuthorizationError);    
    });

    it('should throw AuthorizationError if the user does not have access to the to document', async () => {
      expect.assertions(1);
      await expect(harness.documentsApi.linkDocuments(from, harness.docs[3].id, meta)).rejects.toBeInstanceOf(AuthorizationError);
    });

    it('should throw AlreadyExistsError if a link already exists between the two documents', async () => {
      expect.assertions(1);
      await harness.documentsApi.linkDocuments(from, to, meta);

      await expect(harness.documentsApi.linkDocuments(from, to, meta)).rejects.toBeInstanceOf(AlreadyExistsError);
    });
  });


  describe('testing unlinkDocuments()', () => {
    let user: User;
    let from: ID;
    let to: ID;
    const meta = VALID.DOCUMENT_LINK_METAS[0];
    let link: DocumentLink;

    beforeEach(async () => {
      user = await harness.userRepo.getByAuthorId(harness.docs[0].author.id);
      harness.authenticator.useUserId(user.id);

      from = harness.docs[0].id;
      to = harness.docs[1].id;
      link = await harness.linkRepo.link(from, to, meta);
    });

    it('should delete and return the link matching the inputs', async () => {
      expect.assertions(1);
      await expect(harness.documentsApi.unlinkDocuments(from ,to)).resolves.toMatchObject(link);    
    });

    it('should throw NotFoundError if the user does not exist', async () => {
      expect.assertions(1);
      harness.authenticator.useUserId(harness.invalidUserId);
      await expect(harness.documentsApi.unlinkDocuments(from, to)).rejects.toBeInstanceOf(NotFoundError);    
    });

    it('should throw NotFoundError if the matching link cannot be found', async () => {
      expect.assertions(1);
      from = harness.docs[2].id;
      
      await expect(harness.documentsApi.unlinkDocuments(from , to)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw AuthorizationError if the user does not have acces to the documents', async () => {
      expect.assertions(1);
      harness.authenticator.useUserId(harness.users[1].id);

      await expect(harness.documentsApi.unlinkDocuments(from , to)).rejects.toBeInstanceOf(AuthorizationError);
    });
  });


  describe('testing importDocumentFromUrl()', () => {
    it('should have written tests', () => {
      throw new NotImplementedError();
    });
  });


  describe('testing graphByQuery()', () => {
    beforeEach(async () => {
      const user = harness.users[0];
      harness.authenticator.useUserId(user.id);
    });

    it.each(VALID.DOCUMENT_GRAPH_QUERIES)('should return a a valid DocumentGraph for %p', async query => {
      expect.assertions(1);

      const result = await harness.documentsApi.graphByQuery(query);

      expect(() => validateDocumentGraph(result)).not.toThrow();
    });

    it.each(INVALID.OPTIONAL_DOCUMENT_GRAPH_QUERIES)('should throw ValidationError if given for %p', async query => {
      expect.assertions(1);

      await expect(harness.documentsApi.graphByQuery(query)).rejects.toBeInstanceOf(ValidationError);
      // harness.documentsApi.graphByQuery(query);
    });
  });


  describe('testing listContentConversions()', () => {
    it.each(VALID.CONTENT_TYPES)('should return a list of contentType strings when given %p', async contentType => {
      const result = await harness.documentsApi.listContentConversions(contentType);
      result.forEach(el => expect(() => validateContentType(el)).not.toThrow());
    });

    it.each(INVALID.CONTENT_TYPES)('should throw ValidationError if given %p', async value => {
      expect.assertions(1);
      await expect(harness.documentsApi.listContentConversions(value)).rejects.toBeInstanceOf(ValidationError);
    });
  });

  
  describe('testing convertContent()', () => {
    it('should have written tests', () => {
      throw new NotImplementedError();
    });
  });
})