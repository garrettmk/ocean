import { ContentAnalysisManager, NotImplementedError } from "@/domain";
import { DefaultAnalysisManager, defaultAnalyzers } from "@/content";
import { AuthorRepository, Document, DocumentLinkRepository, DocumentRepository, NotFoundError, UpdateDocumentInput, validateDocument, ValidationError } from "@/domain";
import { MemoryAuthorRepository, MemoryDocumentLinkRepository, MemoryDocumentRepository, MemoryUserRepository } from "../../../server/interfaces";
import { CreateDocumentInput, ServerDocumentInteractor, User, UserRepository } from "../../../server/usecases";
import { AuthorizationError } from "../../../server/usecases/server-errors";



describe('Testing ServerDocumentInteractor', () => {
  let interactor: ServerDocumentInteractor;
  let documents: DocumentRepository;
  let users: UserRepository;
  let authors: AuthorRepository;
  let analysis: ContentAnalysisManager;
  let links: DocumentLinkRepository;

  beforeEach(() => {
    authors = new MemoryAuthorRepository();
    users = new MemoryUserRepository();
    documents = new MemoryDocumentRepository(authors);
    analysis = new DefaultAnalysisManager(defaultAnalyzers);
    links = new MemoryDocumentLinkRepository();
    interactor = new ServerDocumentInteractor(documents, users, analysis, links);
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

  describe('Testing create()', () => {
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
      expect(documents.getById(doc.id)).resolves.toMatchObject(doc);
      expect(doc.author.id).toBe(user.author.id);
    });
  
  
    it('should throw NotFoundError given an invalid userId', async () => {
      expect.assertions(1);
      expect(interactor.createDocument('vader', input)).rejects.toBeInstanceOf(NotFoundError);
    });
  
  
    it('should throw ValidationError if given an invalid input', async () => {
      expect.assertions(1);
      const input = { title: 123 } as unknown as CreateDocumentInput;
  
      expect(interactor.createDocument(user.id, input)).rejects.toBeInstanceOf(ValidationError);
    });
  });


  describe('Testing listDocuments()', () => {
    it('should return all public documents', async () => {
      expect.assertions(1);
      const docs = await populate();
      const publicDocs = docs.filter(doc => doc.isPublic);
  
      expect(interactor.listDocuments()).resolves.toMatchObject(publicDocs);
    });
  
  
    it('should return all documents with a matching author', async () => {
      expect.assertions(1);
      const docs = await populate();
      const authorDocs = docs.filter(doc => doc.author.name === 'Luke');
  
      expect(interactor.listDocuments('luke')).resolves.toMatchObject(authorDocs);
    });
  
  
    it('should throw NotFoundError if given a non-existent user id', async () => {
      expect.assertions(1);
      const docs = await populate();
  
      expect(interactor.listDocuments('vader')).rejects.toBeInstanceOf(NotFoundError);
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
      expect(interactor.updateDocument('luke', document.id, input )).resolves.toMatchObject(expected);
    });


    it('should save the updated document in the repository', async () => {
      expect.assertions(1);

      await interactor.updateDocument('luke', document.id, input);
      
      expect(documents.getById(document.id)).resolves.toMatchObject(expected);
    });


    it('should throw NotFoundError if given a non-existent Author id', async () => {
      expect.assertions(1);
      expect(interactor.updateDocument('vader', document.id, input)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw NotFoundError if given a non-existent document id', async () => {
      expect.assertions(1);
      expect(interactor.updateDocument('luke', 'rawr', input)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw AuthorizationError if the user is not the document author', async () => {
      expect.assertions(1);
      expect(interactor.updateDocument('leia', document.id, input)).rejects.toBeInstanceOf(AuthorizationError);
    });


    it('should throw ValidationError if the input is invalid', async () => {
      expect.assertions(1);
      const invalidInput = { title: 123 } as unknown as UpdateDocumentInput;
      expect(interactor.updateDocument('luke', document.id, invalidInput)).rejects.toBeInstanceOf(ValidationError);
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
      expect(interactor.getDocument('luke', document.id)).resolves.toMatchObject(document);
    });

    
    it('should return a public document even if no user id is given', async () => {
      expect.assertions(1);
      const document = docs.find(doc => doc.isPublic) as Document;
      expect(interactor.getDocument(undefined, document.id)).resolves.toMatchObject(document);
    });


    it('should throw NotFoundError if given a nonexistent user id', async () => {
      expect.assertions(1);
      expect(interactor.getDocument('vader', docs[0].id)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw AuthorizationError if the document is not public and the user is not the author', async () => {
      expect.assertions(1);
      const document = docs.find(doc => doc.isPublic === false) as Document;
      expect(interactor.getDocument('leia', document.id)).rejects.toBeInstanceOf(AuthorizationError);
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
    it('should have written tests', () => {
      throw new NotImplementedError();
    });
  });


  describe('Testing linkDocuments()', () => {
    it('should have written tests', () => {
      throw new NotImplementedError();
    });
  });

  
  describe('Testing unlinkDocuments()', () => {
    it('should have written tests', () => {
      throw new NotImplementedError();
    })
  })
});