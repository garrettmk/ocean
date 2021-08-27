import { DocumentHeader, NotFoundError, NotImplementedError, validateDocument, ValidationError } from "@/domain";
import { AuthorizationError, CreateDocumentInput } from "@/server";
import { UpdateDocumentInput } from "@/server/usecases";
import e from "cors";
import { ServerTestHarness } from "../__mocks__/server-test-harness";


describe('Testing OceanServer', () => {
  let harness: ServerTestHarness;


  beforeEach(async () => {
    harness = new ServerTestHarness();
    await harness.server.listen();
    await harness.populate();
  });


  afterEach(() => {
    harness.server.close();
  });


  describe('testing listDocuments()', () => {
    it('should only return headers from the given author', async () => {
      expect.assertions(1);
  
      const expected = await harness.getUserDocumentsHeaders('luke');
      harness.authenticator.useUserId('luke');
      
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
  
      harness.authenticator.useUserId('vader');
  
      await expect(harness.documentsApi.listDocuments()).rejects.toBeInstanceOf(Error)
    });
  });


  describe('testing getDocument()', () => {
    it('should return the correct document', async () => {
      expect.assertions(1);

      const document = harness.docs[0];
      const user = await harness.users.getByAuthorId(document.author.id);
      harness.authenticator.useUserId(user.id);

      await expect(harness.documentsApi.getDocument(document.id)).resolves.toMatchObject(document);
    });


    it('should throw NotFoundError if given an invalid document id', async () => {
      expect.assertions(1);

      harness.authenticator.useUserId('luke');

      await expect(harness.documentsApi.getDocument('invalid')).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw NotFoundError if given an invalid user id', async () => {
      expect.assertions(1);

      harness.authenticator.useUserId('vader');
      const documentId = harness.docs[0].id;

      await expect(harness.documentsApi.getDocument(documentId)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw AuthorizationError if the document is not public and user is not the author', async () => {
      expect.assertions(3);

      const user = await harness.users.getById('han');
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
      harness.authenticator.useUserId('luke');
      const user = await harness.users.getById('luke');
      const input: CreateDocumentInput = {};

      const document = await harness.documentsApi.createDocument(input);

      expect(() => validateDocument(document)).not.toThrow();
      await expect(harness.documents.getById(document.id)).resolves.toEqual(
        expect.objectContaining({ id: document.id })
      )
    });


    it('should throw NotFoundError if the user is not found', async () => {
      expect.assertions(1);
      harness.authenticator.useUserId('vader');
      const input: CreateDocumentInput = {};

      await expect(harness.documentsApi.createDocument(input)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw ValidationError if given an invalid input', async () => {
      expect.assertions(1);
      harness.authenticator.useUserId('luke');
      const input = { title: 123 } as unknown as CreateDocumentInput;

      await expect(harness.documentsApi.createDocument(input)).rejects.toBeInstanceOf(ValidationError);
    });
  });


  describe('testing updateDocument()', () => {
    it('should modify and return the document', async () => {
      expect.assertions(3);
      harness.authenticator.useUserId('luke');
      const user = await harness.users.getById('luke');
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
      harness.authenticator.useUserId('vader');
      const document = harness.docs[0];
      const input: UpdateDocumentInput = { title: 'A new title' };

      await expect(harness.documentsApi.updateDocument(document.id, input)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw NotFoundError if the document can\'t be found', async () => {
      expect.assertions(1);
      harness.authenticator.useUserId('luke');
      const input: UpdateDocumentInput = { title: 'New title' };

      await expect(harness.documentsApi.updateDocument('9999', input)).rejects.toBeInstanceOf(NotFoundError);
    });
  });


  describe('testing deleteDocument()', () => {
    it('should delete the document', async () => {
      expect.assertions(1);
      const document = harness.docs[0];
      const user = await harness.users.getByAuthorId(document.author.id);
      harness.authenticator.useUserId(user.id);

      await expect(harness.documentsApi.deleteDocument(document.id)).resolves.toMatchObject(document);
    });


    it('should throw NotFoundError if the user can\'t be found', async () => {
      expect.assertions(1);
      const document = harness.docs[0];
      harness.authenticator.useUserId('vader');

      await expect(harness.documentsApi.deleteDocument(document.id)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw NotFoundError if the document can\'t be found', async () => {
      expect.assertions(1);
      harness.authenticator.useUserId('luke');

      await expect(harness.documentsApi.deleteDocument('909999')).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw AuthorizationError if the user is not the documents author', async () => {
      expect.assertions(1);
      const document = harness.docs[0];
      harness.authenticator.useUserId('leia');

      await expect(harness.documentsApi.deleteDocument(document.id)).rejects.toBeInstanceOf(AuthorizationError);
    });
  });
})